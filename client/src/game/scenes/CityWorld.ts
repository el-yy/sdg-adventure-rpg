import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { ensurePlayerAnimations, updatePlayerAnimation } from '../systems/PlayerAnimations';
import { buildCozyEnvironment } from '../systems/WorldEnvironment';
import { createCozyDialog } from '../systems/CozyDialog';
import { updateNpcPrompts } from '../systems/NpcPrompts';

export class CityWorld extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private dialogBox!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogVisible = false;

  constructor() {
    super('CityWorld');
  }

  create() {
    ensurePlayerAnimations(this);
    this.createCityEnvironment();
    this.createPlayer();
    this.createNPCs();
    this.createDialogBox();
    this.setupInput();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 1200, 900);
    this.cameras.main.setZoom(Math.max(1, Math.min(this.scale.width / 960, this.scale.height / 640)));
    this.cameras.main.setBackgroundColor(0x8f8778);
    EventBus.emit('current-scene-ready', this);
  }

  private createCityEnvironment() {
    buildCozyEnvironment(this, 'city');
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(600, 450, 'player-sheet', 0);
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
  }

  private createNPCs() {
    const npcData = [
      { x: 200, y: 200, name: 'Mayor', dialog: 'Our city needs your help! We need sustainable development plans.' },
      { x: 600, y: 200, name: 'Urban Planner', dialog: 'We must balance economic growth with environmental protection.' },
      { x: 400, y: 600, name: 'Social Worker', dialog: 'Inequality is growing. We need policies that help everyone.' },
      { x: 850, y: 400, name: 'Transport Official', dialog: 'Our streets are unsafe. Can you design better transportation?' },
      { x: 500, y: 800, name: 'Community Leader', dialog: 'Let us transform empty lots into community gardens!' },
    ];

    npcData.forEach((data) => {
      const npc = this.physics.add.sprite(data.x, data.y, 'npc');
      npc.setScale(1.5);
      npc.setData('name', data.name);
      npc.setData('dialog', data.dialog);
      npc.setImmovable(true).setDepth(data.y);

      const nameTag = this.add.text(data.x, data.y - 34, `E  Talk to ${data.name}`, {
        fontSize: '10px', color: '#3d291c', backgroundColor: '#f5dfaaee',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setVisible(false);
      npc.setData('nameTag', nameTag);
    });
  }

  private createDialogBox() {
    const dialog = createCozyDialog(this, 0xc27b35);
    this.dialogBox = dialog.container;
    this.dialogText = dialog.text;
  }

  private setupInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey('W'), A: this.input.keyboard.addKey('A'),
        S: this.input.keyboard.addKey('S'), D: this.input.keyboard.addKey('D'),
        E: this.input.keyboard.addKey('E'),
      };
    }
  }

  update() {
    if (!this.player || !this.input.keyboard) return;
    const speed = 160;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.player.setVelocity(vx, vy);
    this.player.setDepth(this.player.y);
    updatePlayerAnimation(this.player, vx, vy);
    updateNpcPrompts(this, this.player);

    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      if (this.dialogVisible) {
        this.dialogBox.setVisible(false);
        this.dialogVisible = false;
        return;
      }
      const npcs = this.children.list.filter(c => c.getData && c.getData('name')) as Phaser.Physics.Arcade.Sprite[];
      for (const npc of npcs) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < 60) {
          this.dialogText.setText(npc.getData('dialog') as string);
          this.dialogBox.setVisible(true);
          this.dialogVisible = true;
          return;
        }
      }
    }
  }
}
