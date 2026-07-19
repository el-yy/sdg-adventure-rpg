import Phaser from 'phaser';
import type { Cell, WorldMapDefinition, WorldPropDefinition } from '../data/worldMaps';

export const COZY_TILE_SIZE = 128;

export interface RenderedWorld {
  collisions: Phaser.Physics.Arcade.StaticGroup;
  worldWidth: number;
  worldHeight: number;
}

const cellKey = ([column, row]: Cell) => `${column}:${row}`;

function pathTileFor(column: number, row: number, pathKeys: Set<string>) {
  const north = pathKeys.has(`${column}:${row - 1}`);
  const east = pathKeys.has(`${column + 1}:${row}`);
  const south = pathKeys.has(`${column}:${row + 1}`);
  const west = pathKeys.has(`${column - 1}:${row}`);
  const count = Number(north) + Number(east) + Number(south) + Number(west);

  if (count >= 4) return { index: 10, rotation: 0 };
  if (count === 3) {
    if (!north) return { index: 9, rotation: 0 };
    if (!east) return { index: 9, rotation: Math.PI / 2 };
    if (!south) return { index: 9, rotation: Math.PI };
    return { index: 9, rotation: -Math.PI / 2 };
  }
  if (count === 2 && !((north && south) || (east && west))) {
    if (east && south) return { index: 8, rotation: 0 };
    if (south && west) return { index: 8, rotation: Math.PI / 2 };
    if (west && north) return { index: 8, rotation: Math.PI };
    return { index: 8, rotation: -Math.PI / 2 };
  }
  if (east || west) return { index: 6, rotation: Math.PI / 2 };
  return { index: 6, rotation: 0 };
}

function waterTileFor(column: number, row: number, waterKeys: Set<string>) {
  const north = waterKeys.has(`${column}:${row - 1}`);
  const east = waterKeys.has(`${column + 1}:${row}`);
  const south = waterKeys.has(`${column}:${row + 1}`);
  const west = waterKeys.has(`${column - 1}:${row}`);
  if (!north && !west) return 16;
  if (!north && !east) return 17;
  if (!north) return 14;
  if (!east || !west) return 18;
  if (!south) return 15;
  return 11 + ((column + row) % 3);
}

function createCollisionBody(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.StaticGroup,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const body = scene.add.rectangle(x, y, width, height, 0x000000, 0);
  scene.physics.add.existing(body, true);
  group.add(body);
}

function addProp(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.StaticGroup,
  prop: WorldPropDefinition,
) {
  const scale = prop.scale ?? 1;
  const image = scene.add.image(prop.x, prop.y, 'cozy-environment', prop.frame)
    .setOrigin(.5, 1)
    .setScale(scale)
    .setDepth(prop.y);

  if (prop.solid) {
    const collisionY = prop.y + (prop.solid.offsetY ?? -prop.solid.height / 2);
    createCollisionBody(scene, group, prop.x, collisionY, prop.solid.width, prop.solid.height);
  }
  return image;
}

function addAmbientDetails(scene: Phaser.Scene, map: WorldMapDefinition) {
  const count = map.id === 'forest' ? 22 : 12;
  for (let index = 0; index < count; index += 1) {
    const x = 90 + ((index * 197) % (map.widthInTiles * COZY_TILE_SIZE - 180));
    const y = 100 + ((index * 113) % (map.heightInTiles * COZY_TILE_SIZE - 200));
    const glow = scene.add.circle(x, y, index % 3 === 0 ? 2 : 1.5, 0xffe66d, .35).setDepth(y + 1);
    scene.tweens.add({
      targets: glow,
      alpha: { from: .1, to: .72 },
      y: y - 12,
      duration: 1300 + (index % 5) * 180,
      delay: (index % 7) * 120,
      yoyo: true,
      repeat: -1,
    });
  }
}

export function renderWorldMap(scene: Phaser.Scene, definition: WorldMapDefinition): RenderedWorld {
  const worldWidth = definition.widthInTiles * COZY_TILE_SIZE;
  const worldHeight = definition.heightInTiles * COZY_TILE_SIZE;
  const tilemap = scene.make.tilemap({
    tileWidth: COZY_TILE_SIZE,
    tileHeight: COZY_TILE_SIZE,
    width: definition.widthInTiles,
    height: definition.heightInTiles,
  });
  const tileset = tilemap.addTilesetImage('cozy-tileset', 'cozy-tileset', COZY_TILE_SIZE, COZY_TILE_SIZE, 0, 0);
  if (!tileset) throw new Error('Unable to initialize the cozy world tileset.');

  const groundLayer = tilemap.createBlankLayer('Ground', tileset, 0, 0);
  const pathLayer = tilemap.createBlankLayer('Paths', tileset, 0, 0);
  const waterLayer = tilemap.createBlankLayer('Water', tileset, 0, 0);
  if (!groundLayer || !pathLayer || !waterLayer) throw new Error('Unable to create cozy world tile layers.');

  for (let row = 0; row < definition.heightInTiles; row += 1) {
    for (let column = 0; column < definition.widthInTiles; column += 1) {
      const pattern = (column * 17 + row * 29 + definition.id.length) % 23;
      const index = pattern === 0 ? 1 : pattern === 5 ? 2 : pattern === 9 ? 3 : pattern === 14 ? 4 : 0;
      groundLayer.putTileAt(index, column, row);
    }
  }

  const pathKeys = new Set(definition.pathCells.map(cellKey));
  definition.pathCells.forEach(([column, row]) => {
    const config = pathTileFor(column, row, pathKeys);
    const tile = pathLayer.putTileAt(config.index, column, row);
    if (tile) tile.rotation = config.rotation;
  });

  const waterKeys = new Set(definition.waterCells.map(cellKey));
  definition.waterCells.forEach(([column, row]) => {
    waterLayer.putTileAt(waterTileFor(column, row, waterKeys), column, row);
  });

  groundLayer.setDepth(-100);
  pathLayer.setDepth(-90);
  waterLayer.setDepth(-80);
  const worldTints: Record<WorldMapDefinition['id'], { ground: number; path: number }> = {
    forest: { ground: 0xffffff, path: 0xfff0d1 },
    health: { ground: 0xe4f6e8, path: 0xf3ead7 },
    education: { ground: 0xf4edca, path: 0xf4dfc0 },
    city: { ground: 0xdbe6d4, path: 0xc9c4b7 },
  };
  groundLayer.setTint(worldTints[definition.id].ground);
  pathLayer.setTint(worldTints[definition.id].path);

  const collisions = scene.physics.add.staticGroup();
  const bridgeKeys = new Set(definition.bridgeCells.map(cellKey));
  definition.waterCells.forEach(([column, row]) => {
    if (bridgeKeys.has(`${column}:${row}`)) return;
    createCollisionBody(
      scene,
      collisions,
      column * COZY_TILE_SIZE + COZY_TILE_SIZE / 2,
      row * COZY_TILE_SIZE + COZY_TILE_SIZE / 2,
      COZY_TILE_SIZE - 16,
      COZY_TILE_SIZE - 16,
    );
  });

  definition.bridgeCells.forEach(([column, row]) => {
    scene.add.image(
      column * COZY_TILE_SIZE + COZY_TILE_SIZE / 2,
      row * COZY_TILE_SIZE + COZY_TILE_SIZE / 2 + 6,
      'cozy-environment',
      'bridge',
    ).setDisplaySize(188, 106).setDepth(-60);
  });

  definition.waterCells.forEach(([column, row], index) => {
    if (index % 2 !== 0) return;
    const shimmer = scene.add.rectangle(
      column * COZY_TILE_SIZE + 44,
      row * COZY_TILE_SIZE + 48,
      24,
      3,
      0xe9ffff,
      .38,
    ).setDepth(-55).setAngle(-8);
    scene.tweens.add({ targets: shimmer, alpha: { from: .08, to: .55 }, duration: 900 + index * 20, yoyo: true, repeat: -1 });
  });

  definition.buildings.forEach(building => addProp(scene, collisions, building));
  definition.props.forEach(prop => addProp(scene, collisions, prop));
  addAmbientDetails(scene, definition);

  scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  return { collisions, worldWidth, worldHeight };
}
