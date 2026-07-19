import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { ensurePlayerAnimations, updatePlayerAnimation } from '../systems/PlayerAnimations';

export class HealthWorld extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private dialogBox!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogVisible = false;

  constructor() {
    super('HealthWorld');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a2a3a);

    ensurePlayerAnimations(this);
    this.createHealthEnvironment();
    this.createPlayer();
    this.createNPCs();
    this.createDialogBox();
    this.setupInput();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 1200, 900);
    EventBus.emit('current-scene-ready', this);
  }

  private createHealthEnvironment() {
    for (let i = 0; i < 8; i++) {
      this.add.image(Phaser.Math.Between(50, 1150), Phaser.Math.Between(50, 850), 'building')
        .setScale(Phaser.Math.FloatBetween(1, 2))
        .setTint(0x42A5F5);
    }
    for (let i = 0; i < 12; i++) {
      this.add.image(Phaser.Math.Between(50, 1150), Phaser.Math.Between(50, 850), 'tree')
        .setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(600, 450, 'player-sheet', 0);
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
  }

  private createNPCs() {
    const npcData = [
      { x: 300, y: 200, name: 'Doctor', dialog: 'Welcome to Health World! Many villagers are sick. Can you help diagnose them?' },
      { x: 700, y: 300, name: 'Nurse', dialog: 'Clean water is the foundation of good health. Let me teach you about sanitation.' },
      { x: 500, y: 700, name: 'Health Worker', dialog: 'Exercise and nutrition are key to preventing disease.' },
    ];

    npcData.forEach((data) => {
      const npc = this.physics.add.sprite(data.x, data.y, 'npc');
      npc.setScale(1.5);
      npc.setData('name', data.name);
      npc.setData('dialog', data.dialog);
      npc.setImmovable(true);

      this.add.text(data.x, data.y - 30, data.name, {
        fontSize: '11px', color: '#ffffff', backgroundColor: '#00000088',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5);
    });
  }

  private createDialogBox() {
    this.dialogBox = this.add.container(0, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    const bg = this.add.rectangle(480, 560, 800, 120, 0x1f2937, 0.95).setStrokeStyle(2, 0x2196F3);
    this.dialogText = this.add.text(120, 510, '', {
      fontSize: '14px', color: '#f9fafb', wordWrap: { width: 720 }, lineSpacing: 4,
    });
    const hint = this.add.text(840, 610, 'Press E to close', { fontSize: '11px', color: '#6b7280' }).setOrigin(1, 1);
    this.dialogBox.add([bg, this.dialogText, hint]);
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
    updatePlayerAnimation(this.player, vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      if (this.dialogVisible) {
        this.dialogBox.setVisible(false);
        this.dialogVisible = false;
        return;
      }
      this.npcInteraction();
    }
  }

  private npcInteraction() {
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
