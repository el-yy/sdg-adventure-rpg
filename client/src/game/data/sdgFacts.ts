export interface SdgFact {
  worldId: string;
  questId?: string;
  facts: string[];
  tips: string[];
}

export const SDG_FACTS: SdgFact[] = [
  {
    worldId: 'forest',
    facts: [
      'Forests cover 31% of the global land area.',
      'Over 1.6 billion people depend on forests for their livelihoods.',
      'Deforestation causes 10% of global greenhouse gas emissions.',
      'Trees absorb CO2 and release oxygen, helping fight climate change.',
      'Biodiversity loss threatens food security and medicine development.',
    ],
    tips: [
      'Plant native trees to restore local ecosystems.',
      'Reduce paper waste by using digital alternatives.',
      'Support sustainable forestry practices.',
      'Reduce your carbon footprint through daily choices.',
      'Learn about your local ecosystem and protect it.',
    ],
  },
  {
    worldId: 'health',
    facts: [
      'Life expectancy has increased by over 6 years since 2000.',
      'Mortality from preventable diseases has dropped significantly.',
      'Access to clean water prevents 1.4 million child deaths annually.',
      'Mental health is as important as physical health.',
      'Vaccines save 3 million lives every year.',
    ],
    tips: [
      'Wash your hands regularly with soap and water.',
      'Eat a balanced diet with fruits and vegetables.',
      'Exercise for at least 30 minutes daily.',
      'Get enough sleep for mental and physical recovery.',
      'Seek help when you feel overwhelmed or stressed.',
    ],
  },
  {
    worldId: 'education',
    facts: [
      'Education is the single most powerful equalizer.',
      'Each additional year of schooling increases earnings by 10%.',
      'Girls with education are less likely to marry young.',
      'Literacy rates have improved from 76% to 86% since 1990.',
      'Digital skills are essential for modern employment.',
    ],
    tips: [
      'Read for at least 20 minutes every day.',
      'Share knowledge with others in your community.',
      'Learn a new skill every month.',
      'Teach someone else what you have learned.',
      'Use technology responsibly for learning.',
    ],
  },
  {
    worldId: 'city',
    facts: [
      'Cities produce over 70% of global CO2 emissions.',
      'Urban areas are home to over 55% of the world population.',
      'Green spaces reduce urban temperatures by 2-8 degrees.',
      'Public transit reduces carbon emissions per passenger.',
      'Inclusive cities have stronger economies and communities.',
    ],
    tips: [
      'Use public transportation when possible.',
      'Support local businesses in your community.',
      'Participate in community planning meetings.',
      'Create green spaces in your neighborhood.',
      'Reduce, reuse, and recycle to minimize waste.',
    ],
  },
];

export function getFactsForWorld(worldId: string): string[] {
  const world = SDG_FACTS.find(w => w.worldId === worldId);
  return world?.facts || [];
}

export function getTipsForWorld(worldId: string): string[] {
  const world = SDG_FACTS.find(w => w.worldId === worldId);
  return world?.tips || [];
}

export function getRandomFact(worldId: string): string {
  const facts = getFactsForWorld(worldId);
  return facts[Math.floor(Math.random() * facts.length)] || 'Learn about the Sustainable Development Goals!';
}

export function getRandomTip(worldId: string): string {
  const tips = getTipsForWorld(worldId);
  return tips[Math.floor(Math.random() * tips.length)] || 'Small actions make a big difference!';
}
