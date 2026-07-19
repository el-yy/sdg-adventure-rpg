import Phaser from 'phaser';

export const COZY_ASSETS = {
  tileset: '/assets/cozy/cozy-tileset.png',
  environment: '/assets/cozy/environment-atlas.png',
  characters: '/assets/cozy/characters-ui-atlas.png',
} as const;

type FrameDefinition = readonly [name: string, x: number, y: number, width: number, height: number];

const environmentFrames: readonly FrameDefinition[] = [
  ['bridge', 1268, 188, 226, 126],
  ['tree-green', 31, 322, 121, 153],
  ['tree-gold', 153, 319, 119, 157],
  ['tree-pink', 286, 319, 118, 157],
  ['pine-large', 457, 319, 108, 164],
  ['pine-small', 573, 337, 80, 137],
  ['pine-wide', 671, 320, 112, 158],
  ['bush-green', 781, 363, 112, 111],
  ['bush-pink', 897, 361, 112, 113],
  ['bush-white', 1018, 363, 112, 111],
  ['bush-fruit', 1133, 363, 112, 111],
  ['shrub', 1250, 369, 93, 101],
  ['hedge', 1385, 342, 83, 132],
  ['flowers-white', 34, 495, 80, 83],
  ['flowers-yellow', 122, 497, 77, 79],
  ['flowers-pink', 207, 496, 81, 80],
  ['flowers-blue', 296, 498, 80, 78],
  ['flowers-tulip', 389, 497, 76, 81],
  ['sapling', 565, 497, 74, 81],
  ['fence-short', 680, 493, 139, 85],
  ['fence-long', 836, 494, 145, 82],
  ['sign', 1002, 486, 122, 99],
  ['lantern-sign', 1137, 478, 109, 112],
  ['rock-small', 1284, 512, 67, 55],
  ['rock-medium', 1355, 491, 91, 78],
  ['rock-large', 1433, 476, 94, 98],
  ['clinic', 37, 604, 280, 226],
  ['school', 326, 595, 290, 238],
  ['town-hall', 622, 598, 283, 232],
  ['cottage', 925, 608, 266, 222],
  ['library', 1188, 600, 292, 233],
  ['garden-leafy', 31, 873, 145, 110],
  ['garden-carrot', 184, 873, 145, 111],
  ['garden-tomato', 337, 873, 146, 111],
  ['crate', 489, 882, 75, 99],
  ['barrel', 567, 877, 84, 104],
  ['flower-pot', 655, 899, 82, 83],
  ['watering-can', 739, 891, 91, 84],
  ['stump', 833, 894, 83, 82],
  ['well', 928, 857, 130, 125],
  ['lamp', 1063, 851, 66, 133],
  ['lamp-alt', 1124, 854, 66, 128],
  ['bench', 1186, 892, 128, 88],
  ['planter', 1320, 893, 117, 89],
  ['fountain', 1431, 876, 91, 106],
];

const characterFrames: readonly FrameDefinition[] = [
  ['player-down-idle', 69, 22, 105, 143],
  ['player-up-idle', 224, 21, 108, 145],
  ['player-right-idle', 383, 21, 102, 145],
  ['player-left-idle', 548, 21, 101, 145],
  ['player-down-walk', 69, 176, 112, 150],
  ['player-up-walk', 224, 176, 111, 151],
  ['player-right-walk', 383, 176, 111, 151],
  ['player-left-walk', 548, 176, 111, 151],
  ['npc-ranger', 43, 342, 141, 213],
  ['npc-seed-keeper', 215, 342, 169, 213],
  ['npc-doctor', 425, 351, 145, 205],
  ['npc-nurse', 597, 351, 151, 205],
  ['npc-teacher', 772, 348, 148, 207],
  ['npc-librarian', 959, 346, 151, 210],
  ['npc-mayor', 1144, 342, 159, 216],
  ['npc-community', 1332, 345, 154, 213],
  ['portrait-ranger', 43, 566, 141, 155],
  ['portrait-seed-keeper', 220, 568, 153, 153],
  ['portrait-doctor', 414, 568, 156, 153],
  ['portrait-nurse', 592, 568, 156, 153],
  ['portrait-teacher', 770, 568, 154, 153],
  ['portrait-librarian', 949, 568, 162, 153],
  ['portrait-mayor', 1130, 568, 175, 153],
  ['portrait-community', 1325, 568, 165, 153],
  ['icon-chat', 67, 753, 119, 92],
  ['icon-quest', 233, 751, 58, 92],
  ['icon-online', 354, 756, 75, 79],
  ['icon-heart', 480, 748, 98, 95],
  ['icon-leaf', 642, 749, 79, 94],
  ['icon-book', 783, 754, 123, 87],
  ['icon-water', 956, 744, 82, 105],
  ['icon-city', 1091, 745, 134, 100],
  ['icon-back', 1254, 751, 92, 91],
  ['icon-journal', 1382, 747, 110, 102],
];

function addFrames(scene: Phaser.Scene, textureKey: string, frames: readonly FrameDefinition[]): void {
  const texture = scene.textures.get(textureKey);
  frames.forEach(([name, x, y, width, height]) => {
    if (!texture.has(name)) texture.add(name, 0, x, y, width, height);
  });
}

export function registerCozyAtlasFrames(scene: Phaser.Scene): void {
  addFrames(scene, 'cozy-environment', environmentFrames);
  addFrames(scene, 'cozy-characters', characterFrames);
}

