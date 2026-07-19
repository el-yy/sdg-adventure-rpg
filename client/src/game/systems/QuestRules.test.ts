import { describe, expect, it } from 'vitest';
import type { ActiveQuest, UserProfile } from '@shared/types';
import { ALL_QUESTS, getStepChoices, validateQuestCatalog } from '../data/questCatalog';
import { WORLD_MAPS } from '../data/worldMaps';
import { npcMatchesTarget } from './QuestRuntimeBuilder';
import { applyQuestStepAction, getQuestAcceptanceStatus } from './QuestRules';

const baseProfile: UserProfile = {
  uid: 'test-user', displayName: 'Player', email: 'player@example.com', avatar: '', level: 20, xp: 0,
  stats: { environmentalKnowledge: 10, healthAwareness: 10, problemSolving: 10, communityImpact: 10 },
  createdAt: '', lastLogin: '', unlockedWorlds: ['forest', 'health', 'education', 'city'],
  activeQuests: [], completedQuests: [], achievements: [], inventory: [],
};

function activeFor(questId: string): ActiveQuest {
  const quest = ALL_QUESTS.find(candidate => candidate.id === questId)!;
  return {
    questId, worldId: quest.worldId, startedAt: '',
    progress: { currentStep: 0, totalSteps: quest.steps.length, completedSteps: [], data: {} },
  };
}

describe('quest catalog', () => {
  it('contains all 18 valid quests and every interaction type', () => {
    expect(ALL_QUESTS).toHaveLength(18);
    expect(validateQuestCatalog()).toEqual([]);
    expect(new Set(ALL_QUESTS.flatMap(quest => quest.steps.map(step => step.type)))).toEqual(
      new Set(['talk', 'explore', 'collect', 'solve', 'decide']),
    );
  });

  it('assigns every quest to a giver and resolves every talk target', () => {
    ALL_QUESTS.forEach(quest => {
      const map = WORLD_MAPS[quest.worldId as keyof typeof WORLD_MAPS];
      expect(map.npcs.some(npc => npc.questIds.includes(quest.id)), `${quest.id} needs a giver`).toBe(true);
      quest.steps.filter(step => step.type === 'talk').forEach(step => {
        expect(map.npcs.some(npc => npcMatchesTarget(npc, step.target)), `${quest.id}/${step.id} needs an NPC`).toBe(true);
      });
    });
  });

  it('provides three curated choices for every challenge', () => {
    ALL_QUESTS.flatMap(quest => quest.steps).filter(step => step.type === 'solve' || step.type === 'decide').forEach(step => {
      expect(getStepChoices(step)).toHaveLength(3);
      expect(getStepChoices(step).some(choice => choice.isCorrect)).toBe(true);
    });
  });
});

describe('quest rules', () => {
  it('enforces level gating, one active quest per world, and duplicate prevention', () => {
    const first = ALL_QUESTS[0];
    const second = ALL_QUESTS.find(quest => quest.worldId === first.worldId && quest.id !== first.id)!;
    expect(getQuestAcceptanceStatus({ ...baseProfile, level: 0 }, first)).toBe('level-locked');
    expect(getQuestAcceptanceStatus({ ...baseProfile, activeQuests: [activeFor(first.id)] }, second)).toBe('world-active');
    expect(getQuestAcceptanceStatus({ ...baseProfile, activeQuests: [activeFor(first.id)] }, first)).toBe('active');
    expect(getQuestAcceptanceStatus({ ...baseProfile, completedQuests: [{ questId: first.id, completedAt: '', score: 100 }] }, first)).toBe('completed');
  });

  it('keeps collection idempotent and advances after three distinct items', () => {
    const quest = ALL_QUESTS.find(candidate => candidate.id === 'dying-forest')!;
    let active = { ...activeFor(quest.id), progress: { ...activeFor(quest.id).progress, currentStep: 2 } };
    const one = applyQuestStepAction(active, quest, 2, { kind: 'collect', itemId: 'seed-1', requiredCount: 3 });
    const duplicate = applyQuestStepAction(one.active, quest, 2, { kind: 'collect', itemId: 'seed-1', requiredCount: 3 });
    const two = applyQuestStepAction(duplicate.active, quest, 2, { kind: 'collect', itemId: 'seed-2', requiredCount: 3 });
    const three = applyQuestStepAction(two.active, quest, 2, { kind: 'collect', itemId: 'seed-3', requiredCount: 3 });
    expect(duplicate.collectedCount).toBe(1);
    expect(three.advanced).toBe(true);
    expect(three.active.progress.currentStep).toBe(3);
  });

  it('records a wrong answer, allows retry, and scores first-attempt performance', () => {
    const quest = ALL_QUESTS.find(candidate => candidate.id === 'dying-forest')!;
    const active = { ...activeFor(quest.id), progress: { ...activeFor(quest.id).progress, currentStep: 1 } };
    const wrong = applyQuestStepAction(active, quest, 1, { kind: 'answer', choiceId: 'wrong', isCorrect: false, bonusXp: 0 });
    const retry = applyQuestStepAction(wrong.active, quest, 1, { kind: 'answer', choiceId: 'illegal-logging', isCorrect: true, bonusXp: 15 });
    expect(wrong.advanced).toBe(false);
    expect(retry.advanced).toBe(true);
    expect(retry.firstTryCorrect).toBe(false);
    expect(retry.mistakes).toBe(1);
  });
});
