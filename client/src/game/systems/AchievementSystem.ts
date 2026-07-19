import type { Achievement } from '@shared/types';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: 'forest-protector', name: 'Forest Protector', description: 'Complete 10 environmental quests', icon: '🌲', condition: 'complete_10_environmental' },
  { id: 'wildlife-guardian', name: 'Wildlife Guardian', description: 'Complete the Wildlife Rescue quest', icon: '🦁', condition: 'complete_wildlife' },
  { id: 'green-energy-pioneer', name: 'Green Energy Pioneer', description: 'Complete the Green Energy Quest', icon: '⚡', condition: 'complete_green_energy' },
  { id: 'health-hero', name: 'Health Hero', description: 'Finish all health quests', icon: '❤️', condition: 'complete_all_health' },
  { id: 'fitness-champion', name: 'Fitness Champion', description: 'Complete the Healthy Lifestyle Challenge', icon: '💪', condition: 'complete_fitness' },
  { id: 'mind-wellness', name: 'Mind Wellness Advocate', description: 'Complete the Mind Matters quest', icon: '🧠', condition: 'complete_mental_health' },
  { id: 'vaccination-champion', name: 'Vaccination Champion', description: 'Complete the Vaccination Drive', icon: '💉', condition: 'complete_vaccination' },
  { id: 'knowledge-keeper', name: 'Knowledge Keeper', description: 'Complete The Lost Knowledge quest', icon: '📚', condition: 'complete_lost_knowledge' },
  { id: 'scholar', name: 'Scholar Badge', description: 'Complete the Knowledge Challenge', icon: '🎓', condition: 'complete_knowledge_challenge' },
  { id: 'digital-champion', name: 'Digital Inclusion Champion', description: 'Complete Bridging the Digital Divide', icon: '💻', condition: 'complete_digital_access' },
  { id: 'education-champion', name: 'Education Champion', description: 'Complete Empowering Teachers', icon: '👩‍🏫', condition: 'complete_teacher_training' },
  { id: 'urban-planner', name: 'Urban Planner Badge', description: 'Complete The Broken City quest', icon: '🏗️', condition: 'complete_broken_city' },
  { id: 'sustainable-planner', name: 'Sustainable Planner', description: 'Complete City Development Decision', icon: '🏙️', condition: 'complete_city_development' },
  { id: 'equity-advocate', name: 'Equity Advocate', description: 'Complete Bridging the Gap', icon: '⚖️', condition: 'complete_inequality_gap' },
  { id: 'safety-champion', name: 'Safety Champion', description: 'Complete the Safe Streets Initiative', icon: '🚦', condition: 'complete_safe_transport' },
  { id: 'urban-gardener', name: 'Urban Gardener', description: 'Complete the Urban Greening quest', icon: '🌱', condition: 'complete_community_garden' },
  { id: 'first-quest', name: 'First Steps', description: 'Complete your first quest', icon: '🌟', condition: 'complete_first_quest' },
  { id: 'level-5', name: 'Rising Guardian', description: 'Reach Level 5', icon: '⭐', condition: 'reach_level_5' },
  { id: 'level-10', name: 'Sustainability Champion', description: 'Reach Level 10', icon: '🏆', condition: 'reach_level_10' },
  { id: 'sdg-master', name: 'SDG Master', description: 'Complete all worlds', icon: '🌍', condition: 'complete_all_worlds' },
];

export class AchievementSystem {
  static getAchievement(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
  }

  static isEarned(achievements: Achievement[], badgeId: string): boolean {
    return achievements.some(a => a.badgeId === badgeId);
  }

  static checkLevelAchievements(level: number, achievements: Achievement[]): Achievement[] {
    const newAchievements: Achievement[] = [];

    if (level >= 5 && !this.isEarned(achievements, 'level-5')) {
      newAchievements.push({ badgeId: 'level-5', earnedAt: new Date().toISOString() });
    }
    if (level >= 10 && !this.isEarned(achievements, 'level-10')) {
      newAchievements.push({ badgeId: 'level-10', earnedAt: new Date().toISOString() });
    }

    return newAchievements;
  }

  static checkQuestAchievements(completedQuests: string[], achievements: Achievement[]): Achievement[] {
    const newAchievements: Achievement[] = [];

    if (completedQuests.length >= 1 && !this.isEarned(achievements, 'first-quest')) {
      newAchievements.push({ badgeId: 'first-quest', earnedAt: new Date().toISOString() });
    }

    const healthQuests = ['sick-village', 'healthy-lifestyle', 'mental-health', 'vaccination-drive'];
    if (healthQuests.every(q => completedQuests.includes(q)) && !this.isEarned(achievements, 'health-hero')) {
      newAchievements.push({ badgeId: 'health-hero', earnedAt: new Date().toISOString() });
    }

    const allQuests = [
      'dying-forest', 'waste-invasion', 'wildlife-rescue', 'carbon-tracker', 'green-energy',
      'sick-village', 'healthy-lifestyle', 'mental-health', 'vaccination-drive',
      'lost-knowledge', 'knowledge-challenge', 'digital-access', 'teacher-training',
      'broken-city', 'city-development', 'inequality-gap', 'safe-transport', 'community-garden',
    ];
    if (allQuests.every(q => completedQuests.includes(q)) && !this.isEarned(achievements, 'sdg-master')) {
      newAchievements.push({ badgeId: 'sdg-master', earnedAt: new Date().toISOString() });
    }

    return newAchievements;
  }

  static getAllDefinitions(): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS;
  }
}
