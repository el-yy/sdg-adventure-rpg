import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { ForestWorld } from './scenes/ForestWorld';
import { HealthWorld } from './scenes/HealthWorld';
import { EducationWorld } from './scenes/EducationWorld';
import { CityWorld } from './scenes/CityWorld';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, ForestWorld, HealthWorld, EducationWorld, CityWorld],
};
