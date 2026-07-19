import type { ActiveQuest, QuestDefinition, UserProfile } from '@shared/types';

interface QuestProgressData {
  attempts?: Record<string, string[]>;
  collected?: Record<string, string[]>;
  bonusXp?: number;
  mistakes?: number;
}

export type QuestProgressAction =
  | { kind: 'advance' }
  | { kind: 'collect'; itemId: string; requiredCount: number }
  | { kind: 'answer'; choiceId: string; isCorrect: boolean; bonusXp: number };

export interface StepProgressResult {
  active: ActiveQuest;
  advanced: boolean;
  collectedCount?: number;
  requiredCount?: number;
  firstTryCorrect?: boolean;
  mistakes: number;
  bonusXp: number;
}

export type QuestAcceptanceStatus = 'allowed' | 'completed' | 'active' | 'level-locked' | 'world-active';

export function getQuestAcceptanceStatus(profile: UserProfile, quest: QuestDefinition): QuestAcceptanceStatus {
  if (profile.completedQuests.some(completed => completed.questId === quest.id)) return 'completed';
  if (profile.activeQuests.some(active => active.questId === quest.id)) return 'active';
  if (profile.level < quest.requiredLevel) return 'level-locked';
  if (profile.activeQuests.some(active => active.worldId === quest.worldId)) return 'world-active';
  return 'allowed';
}

export function applyQuestStepAction(
  active: ActiveQuest,
  quest: QuestDefinition,
  expectedStep: number,
  action: QuestProgressAction,
): StepProgressResult {
  if (active.progress.currentStep !== expectedStep) throw new Error('Quest progress changed. Refreshing the latest objective.');
  const step = quest.steps[expectedStep];
  if (!step) throw new Error('The current quest objective is invalid.');
  const data = (active.progress.data ?? {}) as QuestProgressData;
  const attempts = { ...(data.attempts ?? {}) };
  const collected = { ...(data.collected ?? {}) };
  let bonusXp = data.bonusXp ?? 0;
  let mistakes = data.mistakes ?? 0;
  let advanced = action.kind === 'advance';
  let collectedCount: number | undefined;
  let requiredCount: number | undefined;
  let firstTryCorrect: boolean | undefined;

  if (action.kind === 'collect') {
    const current = new Set(collected[step.id] ?? []);
    current.add(action.itemId);
    collected[step.id] = [...current];
    collectedCount = current.size;
    requiredCount = action.requiredCount;
    advanced = current.size >= action.requiredCount;
  }

  if (action.kind === 'answer') {
    const previousAttempts = attempts[step.id] ?? [];
    firstTryCorrect = action.isCorrect && previousAttempts.length === 0;
    attempts[step.id] = [...previousAttempts, action.choiceId];
    if (!action.isCorrect) mistakes += 1;
    if (action.isCorrect) bonusXp += action.bonusXp;
    advanced = action.isCorrect;
  }

  return {
    active: {
      ...active,
      progress: {
        ...active.progress,
        data: { attempts, collected, bonusXp, mistakes },
        currentStep: advanced ? expectedStep + 1 : expectedStep,
        completedSteps: advanced ? [...new Set([...active.progress.completedSteps, expectedStep])] : active.progress.completedSteps,
      },
    },
    advanced,
    collectedCount,
    requiredCount,
    firstTryCorrect,
    mistakes,
    bonusXp,
  };
}
