import { XP_TABLE, LEVEL_TITLES } from '@shared/types';

export class XpSystem {
  static calculateLevel(xp: number): number {
    let level = 1;
    for (let i = 1; i <= 20; i++) {
      if (xp >= (XP_TABLE[i] || 0)) {
        level = i;
      } else {
        break;
      }
    }
    return level;
  }

  static getXpForLevel(level: number): number {
    return XP_TABLE[level] || 0;
  }

  static getXpForNextLevel(currentLevel: number): number {
    return XP_TABLE[currentLevel + 1] || XP_TABLE[20];
  }

  static getXpProgress(currentXp: number, currentLevel: number): number {
    const currentLevelXp = this.getXpForLevel(currentLevel);
    const nextLevelXp = this.getXpForNextLevel(currentLevel);

    if (nextLevelXp === currentLevelXp) return 1;

    return (currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  }

  static addXp(currentXp: number, xpGain: number): { newXp: number; leveledUp: boolean; newLevel: number } {
    const oldLevel = this.calculateLevel(currentXp);
    const newXp = currentXp + xpGain;
    const newLevel = this.calculateLevel(newXp);

    return {
      newXp,
      leveledUp: newLevel > oldLevel,
      newLevel,
    };
  }

  static getLevelTitle(level: number): string {
    return LEVEL_TITLES[level] || 'SDG Guardian';
  }
}
