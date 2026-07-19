import type { CharacterStats } from '@shared/types';

export class CharacterSystem {
  static createDefaultStats(): CharacterStats {
    return {
      environmentalKnowledge: 10,
      healthAwareness: 10,
      problemSolving: 10,
      communityImpact: 10,
    };
  }

  static addXpToStat(stats: CharacterStats, statName: keyof CharacterStats, amount: number): CharacterStats {
    return {
      ...stats,
      [statName]: Math.min(100, stats[statName] + amount),
    };
  }

  static getStatCheck(stats: CharacterStats, statName: keyof CharacterStats, difficulty: number): boolean {
    const statValue = stats[statName];
    const roll = Math.floor(Math.random() * 20) + 1;
    return roll + statValue >= difficulty;
  }

  static getTotalStats(stats: CharacterStats): number {
    return stats.environmentalKnowledge +
           stats.healthAwareness +
           stats.problemSolving +
           stats.communityImpact;
  }

  static getStrongestStat(stats: CharacterStats): keyof CharacterStats {
    const entries = Object.entries(stats) as [keyof CharacterStats, number][];
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }

  static applyQuestReward(stats: CharacterStats, worldId: string): CharacterStats {
    const statMap: Record<string, keyof CharacterStats> = {
      forest: 'environmentalKnowledge',
      health: 'healthAwareness',
      education: 'problemSolving',
      city: 'communityImpact',
    };

    const stat = statMap[worldId];
    if (stat) {
      return this.addXpToStat(stats, stat, 5);
    }
    return stats;
  }
}
