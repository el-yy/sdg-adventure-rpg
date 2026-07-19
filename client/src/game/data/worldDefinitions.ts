import type { WorldDefinition } from '@shared/types';

export const worldDefinitions: WorldDefinition[] = [
  {
    id: 'forest',
    name: 'Forest World',
    description: 'Protect and restore a damaged ecosystem. Learn about responsible consumption, climate action, and life on land.',
    sdgNumbers: [12, 13, 15],
    quests: ['dying-forest', 'waste-invasion', 'wildlife-rescue', 'carbon-tracker', 'green-energy'],
    requiredLevel: 1,
    color: '#4CAF50',
    icon: '🌲',
  },
  {
    id: 'health',
    name: 'Health World',
    description: 'Improve the health and well-being of a virtual community. Learn about good health practices.',
    sdgNumbers: [3],
    quests: ['sick-village', 'healthy-lifestyle', 'mental-health', 'vaccination-drive'],
    requiredLevel: 2,
    color: '#2196F3',
    icon: '🏥',
  },
  {
    id: 'education',
    name: 'Education World',
    description: 'Help communities improve access to learning and knowledge. Champion quality education for all.',
    sdgNumbers: [4],
    quests: ['lost-knowledge', 'knowledge-challenge', 'digital-access', 'teacher-training'],
    requiredLevel: 3,
    color: '#9C27B0',
    icon: '🎓',
  },
  {
    id: 'city',
    name: 'City World',
    description: 'Build a sustainable and equitable urban community. Address inequalities and create resilient cities.',
    sdgNumbers: [10, 11],
    quests: ['broken-city', 'city-development', 'inequality-gap', 'safe-transport', 'community-garden'],
    requiredLevel: 4,
    color: '#FF9800',
    icon: '🏙️',
  },
];

export function getWorldById(id: string): WorldDefinition | undefined {
  return worldDefinitions.find(w => w.id === id);
}

export function getUnlockedWorlds(level: number): WorldDefinition[] {
  return worldDefinitions.filter(w => w.requiredLevel <= level);
}
