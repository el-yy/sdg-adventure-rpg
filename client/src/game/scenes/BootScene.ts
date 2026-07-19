import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { COZY_ASSETS, registerCozyAtlasFrames } from '../data/cozyAssets';

export class BootScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;
  private loadErrors: string[] = [];

  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x223c28);
    this.add.rectangle(width / 2, height / 2, width, height, 0x223c28);

    for (let index = 0; index < 24; index += 1) {
      const x = (index * 83 + 42) % width;
      const y = (index * 47 + 28) % height;
      this.add.circle(x, y, index % 4 === 0 ? 3 : 2, 0xffe27a, .2);
    }

    const panelWidth = Math.min(480, width - 40);
    const panelHeight = 190;
    this.add.rectangle(width / 2, height / 2, panelWidth + 12, panelHeight + 12, 0x2b180d, .95).setStrokeStyle(4, 0x1b1009);
    this.add.rectangle(width / 2, height / 2 - 4, panelWidth, panelHeight, 0x7c4723, 1).setStrokeStyle(3, 0xb97935);
    this.add.rectangle(width / 2, height / 2 + 6, panelWidth - 24, panelHeight - 34, 0xf5dfa6, 1).setStrokeStyle(3, 0x5b351c);
    this.add.text(width / 2, height / 2 - 54, 'SDG ADVENTURE', {
      fontSize: '25px', color: '#4a2e1d', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(.5);
    this.loadingText = this.add.text(width / 2, height / 2 - 16, 'Packing your satchel…', {
      fontSize: '14px', color: '#765238', fontFamily: 'Georgia, serif',
    }).setOrigin(.5);

    const barWidth = panelWidth - 90;
    const barY = height / 2 + 31;
    this.add.rectangle(width / 2, barY, barWidth + 8, 18, 0x3b2518, 1);
    const barFill = this.add.rectangle(width / 2 - barWidth / 2, barY, 0, 10, 0x789c3f, 1).setOrigin(0, .5);
    const percentText = this.add.text(width / 2, barY + 28, '0%', {
      fontSize: '11px', color: '#725035', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(.5);

    this.load.image('cozy-tileset', COZY_ASSETS.tileset);
    this.load.image('cozy-environment', COZY_ASSETS.environment);
    this.load.image('cozy-characters', COZY_ASSETS.characters);
    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      barFill.width = barWidth * value;
      percentText.setText(`${Math.round(value * 100)}%`);
    });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.loadErrors.push(file.key);
    });
  }

  create() {
    registerCozyAtlasFrames(this);
    if (this.loadErrors.length > 0) {
      this.loadingText?.setText(`Some artwork could not load: ${this.loadErrors.join(', ')}`);
      this.loadingText?.setColor('#9a3027');
      return;
    }
    this.loadingText?.setText('The path is ready!');
    this.time.delayedCall(320, () => EventBus.emit('current-scene-ready', this));
  }
}
