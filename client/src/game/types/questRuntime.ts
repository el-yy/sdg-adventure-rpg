import type { QuestStep } from '@shared/types';

export type QuestNpcMarkerKind = 'offer' | 'turn-in';

export interface QuestNpcMarker {
  npcId: string;
  kind: QuestNpcMarkerKind;
}

export interface QuestObjectiveRuntime {
  questId: string;
  stepIndex: number;
  stepId: string;
  stepType: QuestStep['type'];
  targetId: string;
  x: number;
  y: number;
  requiredCount: number;
  collectedIds: string[];
}

export interface QuestRuntimeState {
  worldId: string;
  hasActiveQuest: boolean;
  npcMarkers: QuestNpcMarker[];
  objective?: QuestObjectiveRuntime;
}

export type QuestInteractionEvent =
  | { kind: 'npc'; npcId: string }
  | { kind: 'objective'; targetId: string }
  | { kind: 'collectible'; targetId: string; itemId: string };
