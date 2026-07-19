export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  stats: CharacterStats;
  createdAt: string;
  lastLogin: string;
  unlockedWorlds: string[];
  activeQuests: ActiveQuest[];
  completedQuests: CompletedQuest[];
  achievements: Achievement[];
  inventory: InventoryItem[];
}

export interface CharacterStats {
  environmentalKnowledge: number;
  healthAwareness: number;
  problemSolving: number;
  communityImpact: number;
}

export interface ActiveQuest {
  questId: string;
  worldId: string;
  startedAt: string;
  progress: QuestProgress;
}

export interface CompletedQuest {
  questId: string;
  completedAt: string;
  score: number;
}

export interface QuestProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  data: Record<string, unknown>;
}

export interface Achievement {
  badgeId: string;
  earnedAt: string;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  type: string;
  quantity: number;
  acquiredAt: string;
}

export interface QuestDefinition {
  id: string;
  worldId: string;
  name: string;
  description: string;
  sdgNumbers: number[];
  sdgFacts: string[];
  steps: QuestStep[];
  rewards: QuestRewards;
  requiredLevel: number;
}

export interface QuestStep {
  id: string;
  description: string;
  type: 'talk' | 'collect' | 'solve' | 'decide' | 'explore';
  target?: string;
  options?: DecisionOption[];
  correctAnswer?: string;
}

export interface DecisionOption {
  id: string;
  text: string;
  consequence: string;
  isCorrect: boolean;
  xpReward: number;
}

export interface QuestRewards {
  xp: number;
  items: InventoryItem[];
  achievementId?: string;
}

export interface WorldDefinition {
  id: string;
  name: string;
  description: string;
  sdgNumbers: number[];
  quests: string[];
  requiredLevel: number;
  color: string;
  icon: string;
}

export interface MultiplayerRoom {
  id: string;
  worldId: string;
  hostId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  questId?: string;
  state: Record<string, unknown>;
}

export interface RoomPlayer {
  uid: string;
  displayName: string;
  level: number;
  position: { x: number; y: number };
  isReady: boolean;
}

export const XP_TABLE: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
  6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
  11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 5950,
  16: 6750, 17: 7600, 18: 8500, 19: 9450, 20: 10450,
};

export const LEVEL_TITLES: Record<number, string> = {
  1: 'SDG Beginner', 2: 'SDG Curious', 3: 'SDG Learner', 4: 'SDG Explorer',
  5: 'Community Helper', 6: 'SDG Advocate', 7: 'Eco Warrior', 8: 'Health Champion',
  9: 'Education Pioneer', 10: 'Sustainability Champion', 11: 'Community Builder',
  12: 'SDG Strategist', 13: 'Global Citizen', 14: 'Impact Leader', 15: 'Change Maker',
  16: 'SDG Visionary', 17: 'World Builder', 18: 'SDG Master', 19: 'Guardian of Tomorrow',
  20: 'SDG Guardian',
};
