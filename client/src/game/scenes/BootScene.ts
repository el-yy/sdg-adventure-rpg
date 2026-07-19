import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0e17);

    const barWidth = 320;
    const barHeight = 16;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 40;

    this.add.rectangle(barX + barWidth / 2, barY, barWidth, barHeight, 0x1f2937);
    const barFill = this.add.rectangle(barX + 2, barY, 0, barHeight - 4, 0x4caf50);
    barFill.setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, barY - 30, 'Loading SDG Adventure...', {
      fontSize: '18px',
      color: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif',
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, barY + 30, '0%', {
      fontSize: '14px',
      color: '#9ca3af',
      fontFamily: 'Inter, system-ui, sans-serif',
    }).setOrigin(0.5);

    this.load.image('player', 'assets/characters/player.png');
    this.load.spritesheet('player-sheet', 'assets/characters/player-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image('npc', 'assets/characters/npc.png');
    this.load.image('tree', 'assets/worlds/tree.png');
    this.load.image('building', 'assets/worlds/building.png');
    this.load.image('item', 'assets/worlds/item.png');
    this.load.image('tileset-grass', 'assets/worlds/grass.png');
    this.load.image('tileset-stone', 'assets/worlds/stone.png');

    this.load.on('progress', (value: number) => {
      barFill.width = (barWidth - 4) * value;
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('Ready!');
      this.time.delayedCall(500, () => {
        EventBus.emit('current-scene-ready', this);
      });
    });
  }
}
