export type CozyWorldId = 'forest' | 'health' | 'education' | 'city';

export type Cell = readonly [column: number, row: number];

export interface WorldPropDefinition {
  frame: string;
  x: number;
  y: number;
  scale?: number;
  solid?: { width: number; height: number; offsetY?: number };
}

export interface WorldNpcDefinition {
  x: number;
  y: number;
  name: string;
  dialog: string;
  frame: string;
  portrait: string;
}

export interface WorldQuestZoneDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  message: string;
}

export interface WorldMapDefinition {
  id: CozyWorldId;
  sceneKey: string;
  name: string;
  accent: number;
  background: number;
  widthInTiles: number;
  heightInTiles: number;
  spawn: { x: number; y: number };
  pathCells: Cell[];
  waterCells: Cell[];
  bridgeCells: Cell[];
  buildings: WorldPropDefinition[];
  props: WorldPropDefinition[];
  npcs: WorldNpcDefinition[];
  questZones: WorldQuestZoneDefinition[];
}

const horizontal = (row: number, from: number, to: number): Cell[] =>
  Array.from({ length: to - from + 1 }, (_, index) => [from + index, row] as const);

const vertical = (column: number, from: number, to: number): Cell[] =>
  Array.from({ length: to - from + 1 }, (_, index) => [column, from + index] as const);

const cells = (...groups: Cell[][]): Cell[] => {
  const unique = new Map<string, Cell>();
  groups.flat().forEach(cell => unique.set(`${cell[0]}:${cell[1]}`, cell));
  return [...unique.values()];
};

const forest: WorldMapDefinition = {
  id: 'forest', sceneKey: 'ForestWorld', name: 'Forest World', accent: 0x789c3f,
  background: 0x314d2c, widthInTiles: 16, heightInTiles: 12, spawn: { x: 1050, y: 700 },
  pathCells: cells(
    horizontal(6, 1, 14), vertical(8, 1, 10), vertical(3, 2, 6),
    horizontal(2, 3, 6), horizontal(9, 8, 12), vertical(12, 6, 9),
  ),
  waterCells: cells(vertical(6, 0, 5), vertical(6, 7, 11), horizontal(9, 12, 14), horizontal(10, 11, 14)),
  bridgeCells: [[6, 6]],
  buildings: [
    { frame: 'cottage', x: 420, y: 330, scale: .9, solid: { width: 210, height: 92, offsetY: -38 } },
  ],
  props: [
    { frame: 'pine-large', x: 120, y: 250, scale: 1.05, solid: { width: 48, height: 30 } },
    { frame: 'tree-green', x: 245, y: 520, solid: { width: 48, height: 28 } },
    { frame: 'tree-gold', x: 160, y: 980, solid: { width: 48, height: 28 } },
    { frame: 'tree-pink', x: 470, y: 1220, solid: { width: 48, height: 28 } },
    { frame: 'pine-wide', x: 780, y: 260, solid: { width: 48, height: 30 } },
    { frame: 'pine-large', x: 1280, y: 300, solid: { width: 48, height: 30 } },
    { frame: 'tree-green', x: 1760, y: 400, solid: { width: 48, height: 28 } },
    { frame: 'tree-gold', x: 1860, y: 860, solid: { width: 48, height: 28 } },
    { frame: 'pine-large', x: 1710, y: 1270, solid: { width: 48, height: 30 } },
    { frame: 'bush-pink', x: 300, y: 840, scale: .72 },
    { frame: 'bush-white', x: 1420, y: 540, scale: .7 },
    { frame: 'flowers-blue', x: 720, y: 1090, scale: .65 },
    { frame: 'flowers-yellow', x: 1510, y: 1170, scale: .65 },
    { frame: 'stump', x: 570, y: 880, scale: .8, solid: { width: 45, height: 28 } },
    { frame: 'sign', x: 865, y: 670, scale: .7 },
    { frame: 'garden-leafy', x: 1500, y: 1120, scale: .8, solid: { width: 110, height: 38 } },
    { frame: 'garden-carrot', x: 1640, y: 1120, scale: .8, solid: { width: 110, height: 38 } },
  ],
  npcs: [
    { x: 420, y: 390, name: 'Elder Tree', dialog: 'The forest is losing its balance. Will you help the village restore it?', frame: 'npc-librarian', portrait: 'portrait-librarian' },
    { x: 1040, y: 540, name: 'Ranger', dialog: 'Illegal logging has damaged the northern grove. Look for evidence along the trail.', frame: 'npc-ranger', portrait: 'portrait-ranger' },
    { x: 1080, y: 1160, name: 'Villager', dialog: 'Sustainable forestry keeps both our homes and habitats healthy.', frame: 'npc-community', portrait: 'portrait-community' },
    { x: 1535, y: 990, name: 'Seed Keeper', dialog: 'Take these seeds and plant new trees where the canopy has thinned.', frame: 'npc-seed-keeper', portrait: 'portrait-seed-keeper' },
  ],
  questZones: [
    { x: 330, y: 720, width: 120, height: 120, message: 'Quest Started: The Dying Forest\nInvestigate the damaged grove to find the cause.' },
    { x: 1110, y: 300, width: 120, height: 120, message: 'You found evidence of illegal logging. Report what you learned to the Ranger.' },
    { x: 710, y: 1080, width: 110, height: 110, message: 'Quest Started: Waste Invasion\nCollect and categorize the waste near the forest trail.' },
  ],
};

const health: WorldMapDefinition = {
  id: 'health', sceneKey: 'HealthWorld', name: 'Health World', accent: 0x5d96a7,
  background: 0x426c55, widthInTiles: 16, heightInTiles: 12, spawn: { x: 1030, y: 700 },
  pathCells: cells(horizontal(6, 1, 14), vertical(8, 1, 10), vertical(3, 2, 6), horizontal(3, 3, 8), vertical(12, 6, 9)),
  waterCells: cells(horizontal(9, 1, 3), horizontal(10, 1, 3)), bridgeCells: [],
  buildings: [
    { frame: 'clinic', x: 430, y: 420, scale: 1, solid: { width: 225, height: 92, offsetY: -38 } },
    { frame: 'cottage', x: 1080, y: 340, scale: .86, solid: { width: 195, height: 80, offsetY: -34 } },
  ],
  props: [
    { frame: 'well', x: 1520, y: 770, scale: .9, solid: { width: 78, height: 45 } },
    { frame: 'garden-leafy', x: 1470, y: 1110, scale: .85, solid: { width: 110, height: 38 } },
    { frame: 'garden-carrot', x: 1630, y: 1110, scale: .85, solid: { width: 110, height: 38 } },
    { frame: 'garden-tomato', x: 1790, y: 1110, scale: .85, solid: { width: 110, height: 38 } },
    { frame: 'tree-pink', x: 160, y: 320, solid: { width: 48, height: 28 } },
    { frame: 'tree-green', x: 1760, y: 380, solid: { width: 48, height: 28 } },
    { frame: 'tree-gold', x: 1720, y: 1330, solid: { width: 48, height: 28 } },
    { frame: 'bush-white', x: 720, y: 340, scale: .68 },
    { frame: 'bush-pink', x: 1240, y: 1130, scale: .68 },
    { frame: 'flowers-white', x: 610, y: 1050, scale: .65 },
    { frame: 'flowers-blue', x: 1280, y: 560, scale: .65 },
    { frame: 'bench', x: 970, y: 1040, scale: .75 },
    { frame: 'fountain', x: 360, y: 1260, scale: .9, solid: { width: 58, height: 42 } },
  ],
  npcs: [
    { x: 440, y: 495, name: 'Doctor', dialog: 'Welcome to Health World. Several villagers need help understanding preventable illness.', frame: 'npc-doctor', portrait: 'portrait-doctor' },
    { x: 1050, y: 520, name: 'Nurse', dialog: 'Clean water and sanitation are the foundation of community health.', frame: 'npc-nurse', portrait: 'portrait-nurse' },
    { x: 1510, y: 1010, name: 'Health Worker', dialog: 'Exercise, nutrition, and accessible care help everyone thrive.', frame: 'npc-community', portrait: 'portrait-community' },
  ],
  questZones: [],
};

const education: WorldMapDefinition = {
  id: 'education', sceneKey: 'EducationWorld', name: 'Education World', accent: 0x9a6b9e,
  background: 0x6e674b, widthInTiles: 16, heightInTiles: 12, spawn: { x: 1030, y: 700 },
  pathCells: cells(horizontal(6, 1, 14), vertical(8, 1, 10), vertical(3, 2, 6), horizontal(2, 3, 11), vertical(12, 6, 10)),
  waterCells: [], bridgeCells: [],
  buildings: [
    { frame: 'school', x: 520, y: 365, scale: 1, solid: { width: 235, height: 94, offsetY: -38 } },
    { frame: 'library', x: 1300, y: 360, scale: .92, solid: { width: 235, height: 90, offsetY: -37 } },
  ],
  props: [
    { frame: 'garden-carrot', x: 1540, y: 1120, scale: .82, solid: { width: 110, height: 38 } },
    { frame: 'garden-tomato', x: 1690, y: 1120, scale: .82, solid: { width: 110, height: 38 } },
    { frame: 'bench', x: 1030, y: 1050, scale: .78 },
    { frame: 'fountain', x: 1020, y: 610, scale: .9, solid: { width: 58, height: 42 } },
    { frame: 'tree-pink', x: 170, y: 360, solid: { width: 48, height: 28 } },
    { frame: 'tree-green', x: 1830, y: 420, solid: { width: 48, height: 28 } },
    { frame: 'tree-gold', x: 260, y: 1280, solid: { width: 48, height: 28 } },
    { frame: 'bush-pink', x: 740, y: 370, scale: .68 },
    { frame: 'bush-white', x: 1500, y: 500, scale: .68 },
    { frame: 'flowers-blue', x: 780, y: 1080, scale: .62 },
    { frame: 'flowers-yellow', x: 1230, y: 1080, scale: .62 },
    { frame: 'sign', x: 930, y: 675, scale: .65 },
  ],
  npcs: [
    { x: 515, y: 520, name: 'Teacher', dialog: 'Every learner deserves a safe classroom and a teacher with the resources to help.', frame: 'npc-teacher', portrait: 'portrait-teacher' },
    { x: 1300, y: 520, name: 'Librarian', dialog: 'The library needs books and accessible technology so knowledge can reach everyone.', frame: 'npc-librarian', portrait: 'portrait-librarian' },
    { x: 810, y: 1040, name: 'Student', dialog: 'I want to learn, but our community still lacks computers and reliable access.', frame: 'npc-seed-keeper', portrait: 'portrait-seed-keeper' },
    { x: 1560, y: 1010, name: 'Principal', dialog: 'Supporting teachers creates stronger schools and better opportunities.', frame: 'npc-mayor', portrait: 'portrait-mayor' },
  ],
  questZones: [],
};

const city: WorldMapDefinition = {
  id: 'city', sceneKey: 'CityWorld', name: 'City World', accent: 0xc27b35,
  background: 0x5b6654, widthInTiles: 16, heightInTiles: 12, spawn: { x: 1020, y: 700 },
  pathCells: cells(horizontal(6, 0, 15), vertical(8, 0, 11), vertical(3, 1, 6), vertical(12, 6, 10), horizontal(2, 3, 12), horizontal(9, 8, 13)),
  waterCells: [], bridgeCells: [],
  buildings: [
    { frame: 'town-hall', x: 530, y: 370, scale: .96, solid: { width: 225, height: 90, offsetY: -38 } },
    { frame: 'library', x: 1130, y: 360, scale: .88, solid: { width: 225, height: 86, offsetY: -36 } },
    { frame: 'cottage', x: 1660, y: 390, scale: .82, solid: { width: 185, height: 76, offsetY: -32 } },
  ],
  props: [
    { frame: 'lamp', x: 760, y: 690, scale: .75, solid: { width: 28, height: 24 } },
    { frame: 'lamp-alt', x: 1280, y: 690, scale: .75, solid: { width: 28, height: 24 } },
    { frame: 'bench', x: 790, y: 1030, scale: .8 },
    { frame: 'bench', x: 1260, y: 1030, scale: .8 },
    { frame: 'fountain', x: 1020, y: 620, scale: 1, solid: { width: 62, height: 45 } },
    { frame: 'garden-leafy', x: 1540, y: 1210, scale: .85, solid: { width: 110, height: 38 } },
    { frame: 'garden-tomato', x: 1700, y: 1210, scale: .85, solid: { width: 110, height: 38 } },
    { frame: 'planter', x: 310, y: 950, scale: .72 },
    { frame: 'planter', x: 520, y: 950, scale: .72 },
    { frame: 'tree-green', x: 170, y: 310, scale: .9, solid: { width: 44, height: 26 } },
    { frame: 'tree-gold', x: 1860, y: 900, scale: .9, solid: { width: 44, height: 26 } },
    { frame: 'flowers-tulip', x: 1450, y: 970, scale: .6 },
    { frame: 'sign', x: 930, y: 685, scale: .64 },
  ],
  npcs: [
    { x: 530, y: 520, name: 'Mayor', dialog: 'Our city needs a plan that improves daily life without sacrificing the environment.', frame: 'npc-mayor', portrait: 'portrait-mayor' },
    { x: 1120, y: 520, name: 'Urban Planner', dialog: 'Good streets connect homes, work, nature, and safe public spaces.', frame: 'npc-teacher', portrait: 'portrait-teacher' },
    { x: 760, y: 1000, name: 'Social Worker', dialog: 'A sustainable city must work for every resident, especially those being left behind.', frame: 'npc-community', portrait: 'portrait-community' },
    { x: 1440, y: 790, name: 'Transport Official', dialog: 'Safer walking, cycling, and public transport can transform this neighborhood.', frame: 'npc-doctor', portrait: 'portrait-doctor' },
    { x: 1650, y: 1140, name: 'Community Leader', dialog: 'Let us turn this empty space into a community garden together.', frame: 'npc-seed-keeper', portrait: 'portrait-seed-keeper' },
  ],
  questZones: [],
};

export const WORLD_MAPS: Record<CozyWorldId, WorldMapDefinition> = { forest, health, education, city };
