import type { ActiveQuest, QuestDefinition, QuestStep, UserProfile } from '@shared/types';
import type { WorldMapDefinition, WorldNpcDefinition } from '../data/worldMaps';
import type { QuestRuntimeState } from '../types/questRuntime';

export function npcMatchesTarget(npc: WorldNpcDefinition, target?: string): boolean {
  if (!target) return false;
  return npc.id === target || (npc.targetAliases ?? []).includes(target);
}

export function getCurrentStep(quest: QuestDefinition, active: ActiveQuest): QuestStep | undefined {
  return quest.steps[active.progress.currentStep];
}

function slotIndex(seed: string, length: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  return Math.abs(hash) % length;
}

export function buildQuestRuntime(
  map: WorldMapDefinition,
  profile: UserProfile,
  worldQuests: QuestDefinition[],
): QuestRuntimeState {
  const completedIds = new Set(profile.completedQuests.map(completed => completed.questId));
  const active = profile.activeQuests.find(candidate => candidate.worldId === map.id);
  const activeDefinition = active && worldQuests.find(quest => quest.id === active.questId);
  const currentStep = active && activeDefinition ? getCurrentStep(activeDefinition, active) : undefined;
  const npcMarkers = [] as QuestRuntimeState['npcMarkers'];

  if (active && currentStep?.type === 'talk') {
    const targetNpc = map.npcs.find(npc => npcMatchesTarget(npc, currentStep.target));
    if (targetNpc) npcMarkers.push({ npcId: targetNpc.id, kind: 'turn-in' });
  } else if (!active) {
    map.npcs.forEach(npc => {
      const offered = npc.questIds
        .map(questId => worldQuests.find(quest => quest.id === questId))
        .find(quest => quest && !completedIds.has(quest.id) && profile.level >= quest.requiredLevel);
      if (offered) npcMarkers.push({ npcId: npc.id, kind: 'offer' });
    });
  }

  if (!active || !activeDefinition || !currentStep || currentStep.type === 'talk' || map.objectiveSlots.length === 0) {
    return { worldId: map.id, hasActiveQuest: Boolean(active), npcMarkers };
  }

  const slot = map.objectiveSlots[slotIndex(`${active.questId}:${currentStep.id}`, map.objectiveSlots.length)];
  const data = active.progress.data as { collected?: Record<string, string[]> } | undefined;
  return {
    worldId: map.id,
    hasActiveQuest: true,
    npcMarkers,
    objective: {
      questId: active.questId,
      stepIndex: active.progress.currentStep,
      stepId: currentStep.id,
      stepType: currentStep.type,
      targetId: currentStep.target ?? currentStep.id,
      x: slot.x,
      y: slot.y,
      requiredCount: currentStep.type === 'collect' ? 3 : 1,
      collectedIds: data?.collected?.[currentStep.id] ?? [],
    },
  };
}
