import { doc, runTransaction } from 'firebase/firestore';
import type { ActiveQuest, Achievement, InventoryItem, QuestDefinition, UserProfile } from '@shared/types';
import { db } from './firebase';
import { AchievementSystem } from '../game/systems/AchievementSystem';
import { CharacterSystem } from '../game/systems/CharacterSystem';
import { XpSystem } from '../game/systems/XpSystem';
import { getUnlockedWorlds } from '../game/data/worldDefinitions';
import { applyQuestStepAction, getQuestAcceptanceStatus, type QuestProgressAction } from '../game/systems/QuestRules';
import { getQuestById } from '../game/data/questCatalog';

export type { QuestProgressAction } from '../game/systems/QuestRules';

export interface QuestMutationResult {
  profile: UserProfile;
  advanced: boolean;
  completed: boolean;
  collectedCount?: number;
  requiredCount?: number;
  firstTryCorrect?: boolean;
  xpEarned?: number;
  leveledUp?: boolean;
  previousLevel?: number;
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    level: profile.level ?? 1,
    xp: profile.xp ?? 0,
    stats: profile.stats ?? CharacterSystem.createDefaultStats(),
    activeQuests: (profile.activeQuests ?? []).map(active => {
      const definition = getQuestById(active.questId);
      return {
        ...active,
        worldId: active.worldId ?? definition?.worldId ?? 'forest',
        progress: {
          currentStep: active.progress?.currentStep ?? 0,
          totalSteps: active.progress?.totalSteps ?? definition?.steps.length ?? 0,
          completedSteps: active.progress?.completedSteps ?? [],
          data: active.progress?.data ?? {},
        },
      };
    }),
    completedQuests: profile.completedQuests ?? [],
    inventory: profile.inventory ?? [],
    achievements: profile.achievements ?? [],
    unlockedWorlds: profile.unlockedWorlds ?? ['forest'],
  };
}

function mergeInventory(current: InventoryItem[], rewards: InventoryItem[], acquiredAt: string): InventoryItem[] {
  const inventory = current.map(item => ({ ...item }));
  rewards.forEach(reward => {
    const existing = inventory.find(item => item.itemId === reward.itemId);
    if (existing) existing.quantity += reward.quantity;
    else inventory.push({ ...reward, acquiredAt });
  });
  return inventory;
}

function mergeAchievements(current: Achievement[], additions: Achievement[]): Achievement[] {
  const merged = [...current];
  additions.forEach(achievement => {
    if (!merged.some(existing => existing.badgeId === achievement.badgeId)) merged.push(achievement);
  });
  return merged;
}

export async function acceptQuest(uid: string, quest: QuestDefinition): Promise<UserProfile> {
  const reference = doc(db, 'users', uid);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Your player profile could not be found.');
    const profile = normalizeProfile(snapshot.data() as UserProfile);
    const status = getQuestAcceptanceStatus(profile, quest);
    if (status === 'level-locked') throw new Error(`Reach level ${quest.requiredLevel} to begin this quest.`);
    if (status === 'world-active') throw new Error('Finish your current quest in this world before starting another.');
    if (status === 'completed' || status === 'active') return profile;

    const activeQuest: ActiveQuest = {
      questId: quest.id,
      worldId: quest.worldId,
      startedAt: new Date().toISOString(),
      progress: {
        currentStep: 0,
        totalSteps: quest.steps.length,
        completedSteps: [],
        data: { attempts: {}, collected: {}, bonusXp: 0, mistakes: 0 },
      },
    };
    const updated = { ...profile, activeQuests: [...profile.activeQuests, activeQuest] };
    transaction.set(reference, { activeQuests: updated.activeQuests }, { merge: true });
    return updated;
  });
}

export async function progressQuest(
  uid: string,
  quest: QuestDefinition,
  expectedStep: number,
  action: QuestProgressAction,
): Promise<QuestMutationResult> {
  const reference = doc(db, 'users', uid);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Your player profile could not be found.');
    const profile = normalizeProfile(snapshot.data() as UserProfile);
    const activeIndex = profile.activeQuests.findIndex(active => active.questId === quest.id);
    if (activeIndex < 0) throw new Error('This quest is no longer active.');
    const active = profile.activeQuests[activeIndex];
    if (active.progress.currentStep !== expectedStep) throw new Error('Quest progress changed. Refreshing the latest objective.');
    const stepResult = applyQuestStepAction(active, quest, expectedStep, action);
    const { active: nextActive, advanced, collectedCount, requiredCount, firstTryCorrect, mistakes, bonusXp } = stepResult;

    if (!advanced || nextActive.progress.currentStep < quest.steps.length) {
      const activeQuests = [...profile.activeQuests];
      activeQuests[activeIndex] = nextActive;
      const updated = { ...profile, activeQuests };
      transaction.set(reference, { activeQuests }, { merge: true });
      return { profile: updated, advanced, completed: false, collectedCount, requiredCount, firstTryCorrect };
    }

    const completedAt = new Date().toISOString();
    const score = Math.max(0, 100 - mistakes * 10);
    const completedQuests = [
      ...profile.completedQuests,
      { questId: quest.id, completedAt, score },
    ];
    const xpEarned = quest.rewards.xp + bonusXp;
    const xpResult = XpSystem.addXp(profile.xp, xpEarned);
    const completedIds = completedQuests.map(completed => completed.questId);
    const directAchievement = quest.rewards.achievementId
      ? [{ badgeId: quest.rewards.achievementId, earnedAt: completedAt }]
      : [];
    const questAchievements = AchievementSystem.checkQuestAchievements(completedIds, profile.achievements);
    const levelAchievements = AchievementSystem.checkLevelAchievements(xpResult.newLevel, profile.achievements);
    const achievements = mergeAchievements(profile.achievements, [
      ...directAchievement,
      ...questAchievements,
      ...levelAchievements,
    ]);
    const unlockedWorlds = [...new Set([
      ...profile.unlockedWorlds,
      ...getUnlockedWorlds(xpResult.newLevel).map(world => world.id),
    ])];
    const activeQuests = profile.activeQuests.filter(current => current.questId !== quest.id);
    const updated: UserProfile = {
      ...profile,
      activeQuests,
      completedQuests,
      xp: xpResult.newXp,
      level: xpResult.newLevel,
      stats: CharacterSystem.applyQuestReward(profile.stats, quest.worldId),
      inventory: mergeInventory(profile.inventory, quest.rewards.items, completedAt),
      achievements,
      unlockedWorlds,
    };
    transaction.set(reference, {
      activeQuests,
      completedQuests,
      xp: updated.xp,
      level: updated.level,
      stats: updated.stats,
      inventory: updated.inventory,
      achievements,
      unlockedWorlds,
    }, { merge: true });
    return {
      profile: updated,
      advanced: true,
      completed: true,
      firstTryCorrect,
      xpEarned,
      leveledUp: xpResult.leveledUp,
      previousLevel: profile.level,
    };
  });
}
