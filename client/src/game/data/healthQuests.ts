import type { QuestDefinition } from '@shared/types';

export const healthQuests: QuestDefinition[] = [
  {
    id: 'sick-village',
    worldId: 'health',
    name: 'The Sick Village',
    description: 'Diagnose and treat health problems in the village.',
    sdgNumbers: [3],
    sdgFacts: [
      'SDG 3 aims to ensure healthy lives and promote well-being for all at all ages.',
      'Millions of deaths each year are caused by preventable diseases.',
      'Access to clean water and sanitation is fundamental to health.',
      'Health education reduces disease transmission significantly.',
    ],
    steps: [
      { id: 'examine', description: 'Examine the villagers to identify symptoms', type: 'explore', target: 'village-square' },
      { id: 'diagnose', description: 'Determine the main cause of illness in the village', type: 'solve', correctAnswer: 'contaminated-water' },
      { id: 'treat', description: 'Choose the best treatment approach', type: 'decide', options: [
        { id: 'clean-water', text: 'Provide clean water and sanitation', consequence: 'Addresses root cause, prevents future illness', isCorrect: true, xpReward: 50 },
        { id: 'medication', text: 'Distribute medication only', consequence: 'Treats symptoms but problem may return', isCorrect: false, xpReward: 25 },
        { id: 'ignore', text: 'Wait for natural recovery', consequence: 'Illness may spread to more villagers', isCorrect: false, xpReward: 0 },
      ]},
      { id: 'educate', description: 'Educate villagers about hygiene practices', type: 'talk', target: 'village-doctor' },
    ],
    rewards: { xp: 250, items: [{ itemId: 'health-badge', name: 'Health Hero Badge', type: 'achievement', quantity: 1, acquiredAt: '' }], achievementId: 'health-hero' },
    requiredLevel: 1,
  },
  {
    id: 'healthy-lifestyle',
    worldId: 'health',
    name: 'Healthy Lifestyle Challenge',
    description: 'Help villagers adopt healthier eating and exercise habits.',
    sdgNumbers: [3],
    sdgFacts: [
      'Poor diet is a leading risk factor for global disease burden.',
      'Regular physical activity reduces risk of chronic diseases by 30%.',
      'Mental health is an integral part of overall well-being.',
      'Preventive healthcare is more cost-effective than treatment.',
    ],
    steps: [
      { id: 'assess', description: 'Assess current lifestyle habits of the villagers', type: 'explore', target: 'village-homes' },
      { id: 'nutrition', description: 'Design a balanced meal plan for the village', type: 'solve', correctAnswer: 'balanced-diet' },
      { id: 'exercise', description: 'Set up a community exercise program', type: 'decide', options: [
        { id: 'group', text: 'Organize group exercise activities', consequence: 'Builds community bonds while improving health', isCorrect: true, xpReward: 40 },
        { id: 'individual', text: 'Provide individual fitness plans', consequence: 'Personalized but less community engagement', isCorrect: false, xpReward: 25 },
        { id: 'none', text: 'Leave exercise to individual choice', consequence: 'Some may not participate', isCorrect: false, xpReward: 10 },
      ]},
      { id: 'followup', description: 'Check progress and adjust the program', type: 'talk', target: 'health-worker' },
    ],
    rewards: { xp: 200, items: [{ itemId: 'fitness-badge', name: 'Fitness Champion', type: 'achievement', quantity: 1, acquiredAt: '' }], achievementId: 'fitness-champion' },
    requiredLevel: 3,
  },
  {
    id: 'mental-health',
    worldId: 'health',
    name: 'Mind Matters',
    description: 'Address mental health awareness and provide support.',
    sdgNumbers: [3],
    sdgFacts: [
      '1 in 4 people worldwide will be affected by mental health conditions.',
      'Mental health conditions are a leading cause of disability globally.',
      'Early intervention and support significantly improve outcomes.',
      'Stigma remains the biggest barrier to mental health treatment.',
    ],
    steps: [
      { id: 'listen', description: 'Talk to villagers about their mental well-being', type: 'talk', target: 'villager' },
      { id: 'identify', description: 'Identify common mental health challenges', type: 'solve', correctAnswer: 'stress-management' },
      { id: 'support', description: 'Choose the best community support approach', type: 'decide', options: [
        { id: 'center', text: 'Create a community support center', consequence: 'Provides safe space for sharing and healing', isCorrect: true, xpReward: 45 },
        { id: 'hotline', text: 'Set up a helpline', consequence: 'Accessible but less personal', isCorrect: false, xpReward: 20 },
        { id: 'nothing', text: 'Leave it to families to handle', consequence: 'Many may suffer in silence', isCorrect: false, xpReward: 0 },
      ]},
      { id: 'spread', description: 'Spread mental health awareness in the community', type: 'talk', target: 'community-leader' },
    ],
    rewards: { xp: 230, items: [{ itemId: 'mind-badge', name: 'Mind Wellness Advocate', type: 'achievement', quantity: 1, acquiredAt: '' }], achievementId: 'mind-wellness' },
    requiredLevel: 5,
  },
  {
    id: 'vaccination-drive',
    worldId: 'health',
    name: 'Vaccination Drive',
    description: 'Organize a community vaccination campaign.',
    sdgNumbers: [3],
    sdgFacts: [
      'Vaccines prevent 4-5 million deaths every year.',
      'Immunization coverage has saved millions of lives since 2000.',
      'Herd immunity protects those who cannot be vaccinated.',
      'Equitable vaccine access is crucial for global health security.',
    ],
    steps: [
      { id: 'educate', description: 'Educate parents about vaccine safety', type: 'talk', target: 'parents' },
      { id: 'logistics', description: 'Plan cold chain logistics for vaccine storage', type: 'solve', correctAnswer: 'cold-chain' },
      { id: 'prioritize', description: 'Determine vaccination priority groups', type: 'decide', options: [
        { id: 'elderly', text: 'Start with elderly and immunocompromised', consequence: 'Protects most vulnerable first', isCorrect: true, xpReward: 40 },
        { id: 'children', text: 'Start with children', consequence: 'Important but elderly are higher risk', isCorrect: false, xpReward: 25 },
        { id: 'random', text: 'Random order', consequence: 'Less efficient allocation', isCorrect: false, xpReward: 5 },
      ]},
      { id: 'administer', description: 'Help administer vaccines at the clinic', type: 'explore', target: 'clinic' },
    ],
    rewards: { xp: 280, items: [{ itemId: 'vaccine-badge', name: 'Vaccination Champion', type: 'achievement', quantity: 1, acquiredAt: '' }], achievementId: 'vaccination-champion' },
    requiredLevel: 5,
  },
];
