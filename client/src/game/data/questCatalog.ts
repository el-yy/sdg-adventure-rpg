import type { DecisionOption, QuestDefinition, QuestStep } from '@shared/types';
import { cityQuests } from './cityQuests';
import { educationQuests } from './educationQuests';
import { forestQuests } from './forestQuests';
import { healthQuests } from './healthQuests';

export const ALL_QUESTS: QuestDefinition[] = [
  ...forestQuests,
  ...healthQuests,
  ...educationQuests,
  ...cityQuests,
];

export interface QuestChoice extends DecisionOption {
  explanation: string;
}

type ChoiceSeed = readonly [id: string, text: string, explanation: string];

const knowledgeChoices: Record<string, readonly [ChoiceSeed, ChoiceSeed, ChoiceSeed]> = {
  'illegal-logging': [
    ['illegal-logging', 'Unregulated illegal logging', 'Fresh stumps, tire tracks, and missing mature trees point to illegal logging.'],
    ['seasonal-change', 'Normal seasonal leaf loss', 'Seasonal change does not explain freshly cut trunks or heavy vehicle tracks.'],
    ['too-much-rain', 'Excessive rainfall', 'Rain can stress some trees, but it does not leave saw cuts and timber tracks.'],
  ],
  'recycle-plastic': [
    ['recycle-plastic', 'Clean and sort recyclable plastic', 'Clean, accepted plastics can return to the material cycle.'],
    ['burn-plastic', 'Burn it with dry leaves', 'Burning plastic releases harmful pollutants.'],
    ['bury-plastic', 'Bury it beside the trail', 'Buried plastic persists and can contaminate soil and water.'],
  ],
  'compost-organic': [
    ['compost-organic', 'Compost food and plant waste', 'Composting returns nutrients to soil and reduces landfill methane.'],
    ['mix-organic', 'Mix it with glass and metal', 'Mixed waste is harder to recover and contaminates compost.'],
    ['wash-away', 'Wash it into the stream', 'Dumping organic waste into water reduces oxygen and harms wildlife.'],
  ],
  'gentle-care': [
    ['gentle-care', 'Keep the animal calm and contact a wildlife expert', 'Low-stress handling and expert care protect both the animal and rescuer.'],
    ['feed-anything', 'Feed it household leftovers', 'An unknown diet can make an injured wild animal sicker.'],
    ['release-now', 'Release it immediately', 'An injured animal needs assessment before release.'],
  ],
  'reduce-transport': [
    ['reduce-transport', 'Walk, cycle, or use shared transport', 'Replacing solo car trips reduces fuel use and emissions.'],
    ['idle-car', 'Leave the car running while waiting', 'Idling wastes fuel and adds avoidable pollution.'],
    ['more-flights', 'Take more short-distance flights', 'Short flights generally have a high emissions cost per trip.'],
  ],
  'led-lights': [
    ['led-lights', 'Use efficient LED lighting', 'LEDs use less electricity and last longer than incandescent bulbs.'],
    ['all-day-lights', 'Leave every light on all day', 'Unused lighting wastes energy regardless of bulb type.'],
    ['open-fridge', 'Keep the refrigerator door open', 'The appliance must work harder and consume more energy.'],
  ],
  teamwork: [
    ['teamwork', 'Coordinate roles and follow the safety plan', 'Clear roles and safe teamwork make installation reliable.'],
    ['rush-alone', 'Rush the installation alone', 'Electrical and structural work should not be improvised alone.'],
    ['skip-checks', 'Skip testing to save time', 'Testing is essential before a new energy system goes live.'],
  ],
  'contaminated-water': [
    ['contaminated-water', 'Contaminated drinking water', 'Shared stomach symptoms and an unsafe water source indicate waterborne illness.'],
    ['cold-weather', 'A week of cold weather', 'Cold weather alone does not explain a cluster linked to one water source.'],
    ['lack-of-exercise', 'Too little exercise', 'Exercise matters for health but does not cause an acute village-wide outbreak.'],
  ],
  'balanced-diet': [
    ['balanced-diet', 'A varied plate with vegetables, protein, and whole grains', 'A varied diet provides complementary nutrients and steady energy.'],
    ['sugar-only', 'Sweetened drinks and snacks only', 'High-sugar foods do not provide balanced nutrition.'],
    ['skip-meals', 'Skip most meals', 'Regular nutritious meals are safer than severe restriction.'],
  ],
  'stress-management': [
    ['stress-management', 'Listening, support, and healthy coping strategies', 'Supportive conversation and practical coping skills reduce isolation.'],
    ['ignore-feelings', 'Tell everyone to ignore their feelings', 'Dismissal can deepen distress and prevent people seeking help.'],
    ['public-shame', 'Publicly identify struggling residents', 'Mental-health support must protect dignity and privacy.'],
  ],
  'cold-chain': [
    ['cold-chain', 'Maintain monitored refrigerated storage', 'Vaccines remain effective when stored within their required temperature range.'],
    ['sunlight-box', 'Store doses in direct sunlight', 'Heat and light can damage vaccines.'],
    ['room-shelf', 'Leave doses on an open shelf', 'Unmonitored room-temperature storage breaks the cold chain.'],
  ],
  'community-effort': [
    ['community-effort', 'Organize a safe community rebuilding effort', 'Shared planning combines local skills, ownership, and safety.'],
    ['work-without-plan', 'Begin construction without a plan', 'Unplanned work risks injuries and wasted materials.'],
    ['discard-books', 'Discard all recovered learning materials', 'Usable materials should be cleaned, repaired, and preserved.'],
  ],
  'critical-thinking': [
    ['critical-thinking', 'Explain the reasoning and check the result', 'Critical thinking tests both the method and the answer.'],
    ['guess-fast', 'Choose the first answer without checking', 'A fast guess does not test understanding.'],
    ['copy-only', 'Copy an answer without discussing it', 'Copying hides misconceptions instead of resolving them.'],
  ],
  'ecosystem-balance': [
    ['ecosystem-balance', 'Species and resources are interconnected', 'Changes to one population can affect food, habitat, and other species.'],
    ['single-species', 'Only the largest species matters', 'Ecosystems depend on many organisms and processes.'],
    ['no-change', 'Ecosystems never change', 'Ecosystems are dynamic and respond to natural and human pressures.'],
  ],
  'hands-on-learning': [
    ['hands-on-learning', 'Guided practice with real tasks', 'Learners build confidence by applying skills with support.'],
    ['lecture-only', 'A long lecture without practice', 'Explanation helps, but digital skills require practice.'],
    ['no-guidance', 'Give devices with no guidance', 'Access alone does not guarantee safe and effective use.'],
  ],
  'student-centered': [
    ['student-centered', 'Adapt teaching to learner needs and feedback', 'Student-centered teaching uses evidence from learners to improve instruction.'],
    ['same-for-all', 'Use one method regardless of learner needs', 'A single rigid method can exclude learners.'],
    ['tests-only', 'Teach only what appears on a test', 'Education should develop understanding and transferable skills.'],
  ],
  'green-industry': [
    ['green-industry', 'Cleaner production with strong pollution controls', 'Economic activity can grow while reducing harmful emissions and waste.'],
    ['unchecked-smoke', 'Allow factories to release untreated pollution', 'Untreated emissions transfer costs to public health and ecosystems.'],
    ['move-pollution', 'Move pollution to a poorer district', 'Relocating harm is not a sustainable solution.'],
  ],
  'inclusive-housing': [
    ['inclusive-housing', 'Mixed, affordable housing near services', 'Inclusive housing connects residents to transport, work, and essential services.'],
    ['luxury-only', 'Build only high-cost housing', 'Luxury-only supply does not address affordability for most residents.'],
    ['remote-housing', 'Place housing far from transport and jobs', 'Isolation raises household costs and limits opportunity.'],
  ],
  'recycling-system': [
    ['recycling-system', 'Separated collection, recovery, and public guidance', 'A complete system combines infrastructure with clear participation rules.'],
    ['single-bin-dump', 'Send every material to one open dump', 'Mixed dumping loses materials and creates pollution.'],
    ['street-burning', 'Burn waste on neighborhood streets', 'Open burning releases dangerous smoke.'],
  ],
  'access-to-opportunity': [
    ['access-to-opportunity', 'Unequal access to education, jobs, and services', 'Opportunity gaps compound across income, health, and participation.'],
    ['personal-failure', 'Individual effort is the only cause', 'Structural barriers shape which opportunities people can reach.'],
    ['park-colors', 'The color of public benches', 'Cosmetic details do not explain broad inequality patterns.'],
  ],
  'universal-design': [
    ['universal-design', 'Design spaces usable by people with varied abilities', 'Universal design improves access without segregating users.'],
    ['stairs-only', 'Use stairs as the only entrance', 'Stairs-only access excludes many residents.'],
    ['special-route', 'Hide a separate accessible route at the back', 'Accessible routes should be safe, dignified, and integrated.'],
  ],
  permaculture: [
    ['permaculture', 'Use diverse crops, compost, and water-wise design', 'Diversity and soil care make community gardens more resilient.'],
    ['concrete-lot', 'Cover the growing area in concrete', 'Sealed ground cannot support a productive garden.'],
    ['single-crop', 'Plant one crop without soil planning', 'A diverse plan better supports soil, harvests, and pest resilience.'],
  ],
};

export function getQuestById(questId: string): QuestDefinition | undefined {
  return ALL_QUESTS.find(quest => quest.id === questId);
}

export function getWorldQuests(worldId: string): QuestDefinition[] {
  return ALL_QUESTS.filter(quest => quest.worldId === worldId);
}

export function getStepChoices(step: QuestStep): QuestChoice[] {
  if (step.type === 'decide') {
    return (step.options ?? []).map(option => ({ ...option, explanation: option.consequence }));
  }
  if (step.type !== 'solve' || !step.correctAnswer) return [];
  return (knowledgeChoices[step.correctAnswer] ?? []).map(([id, text, explanation]) => ({
    id,
    text,
    explanation,
    consequence: explanation,
    isCorrect: id === step.correctAnswer,
    xpReward: id === step.correctAnswer ? 15 : 0,
  }));
}

export function validateQuestCatalog(): string[] {
  const errors: string[] = [];
  ALL_QUESTS.forEach(quest => {
    if (quest.steps.length === 0) errors.push(`${quest.id} has no steps`);
    quest.steps.forEach(step => {
      if ((step.type === 'solve' || step.type === 'decide') && getStepChoices(step).length !== 3) {
        errors.push(`${quest.id}/${step.id} must have exactly three choices`);
      }
    });
  });
  return errors;
}

