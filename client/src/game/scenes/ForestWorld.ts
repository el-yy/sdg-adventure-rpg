import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { ensurePlayerAnimations, updatePlayerAnimation } from '../systems/PlayerAnimations';
import { buildCozyEnvironment } from '../systems/WorldEnvironment';
import { createCozyDialog } from '../systems/CozyDialog';
import { updateNpcPrompts } from '../systems/NpcPrompts';

export class ForestWorld extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private npcs: Phaser.Physics.Arcade.Sprite[] = [];
  private questZones: Phaser.GameObjects.Zone[] = [];
  private dialogBox!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogVisible = false;

  constructor() {
    super('ForestWorld');
  }

  create() {
    ensurePlayerAnimations(this);
    this.createForestEnvironment();
    this.createPlayer();
    this.createNPCs();
    this.createQuestZones();
    this.createDialogBox();
    this.setupInput();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 1200, 900);
    this.cameras.main.setZoom(Math.max(1, Math.min(this.scale.width / 960, this.scale.height / 640)));
    this.cameras.main.setBackgroundColor(0x739447);

    EventBus.emit('current-scene-ready', this);
  }

  private createForestEnvironment() {
    buildCozyEnvironment(this, 'forest');
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(600, 450, 'player-sheet', 0);
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
  }

  private createNPCs() {
    const npcData = [
      { x: 300, y: 200, name: 'Elder Tree', dialog: 'The forest is dying. We need your help, Guardian!' },
      { x: 800, y: 300, name: 'Ranger', dialog: 'Illegal logging has destroyed many trees. Can you investigate?' },
      { x: 500, y: 700, name: 'Villager', dialog: 'We need to learn about sustainable forestry.' },
      { x: 900, y: 600, name: 'Seed Keeper', dialog: 'Take these seeds and plant new trees!' },
    ];

    npcData.forEach((data) => {
      const npc = this.physics.add.sprite(data.x, data.y, 'npc');
      npc.setScale(1.5);
      npc.setData('name', data.name);
      npc.setData('dialog', data.dialog);
      npc.setImmovable(true).setDepth(data.y);
      this.npcs.push(npc);

      const nameTag = this.add.text(data.x, data.y - 34, `E  Talk to ${data.name}`, {
        fontSize: '10px', color: '#3d291c', backgroundColor: '#f5dfaaee',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setVisible(false);
      npc.setData('nameTag', nameTag);
    });
  }

  private createQuestZones() {
    const zones = [
      { x: 200, y: 400, w: 100, h: 100, quest: 'dying-forest', step: 0 },
      { x: 700, y: 200, w: 100, h: 100, quest: 'dying-forest', step: 1 },
      { x: 400, y: 600, w: 80, h: 80, quest: 'waste-invasion', step: 0 },
    ];

    zones.forEach((z) => {
      const zone = this.add.zone(z.x, z.y, z.w, z.h);
      this.physics.add.existing(zone, true);
      zone.setData('quest', z.quest);
      zone.setData('step', z.step);
      this.questZones.push(zone);

      const indicator = this.add.circle(z.x, z.y - 42, 13, 0xf5df7a, 1).setStrokeStyle(3, 0x5b351d);
      this.add.text(z.x, z.y - 44, '!', { fontSize: '16px', color: '#4b2c18', fontStyle: 'bold' }).setOrigin(.5);
      this.tweens.add({
        targets: indicator,
        y: indicator.y - 8,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createDialogBox() {
    const dialog = createCozyDialog(this, 0x7d9d45);
    this.dialogBox = dialog.container;
    this.dialogText = dialog.text;
  }

  private setupInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey('W'),
        A: this.input.keyboard.addKey('A'),
        S: this.input.keyboard.addKey('S'),
        D: this.input.keyboard.addKey('D'),
        E: this.input.keyboard.addKey('E'),
      };
    }
  }

  update() {
    if (!this.player || !this.input.keyboard) return;

    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);
    this.player.setDepth(this.player.y);
    updatePlayerAnimation(this.player, vx, vy);
    updateNpcPrompts(this, this.player);

    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      this.handleInteract();
    }
  }

  private handleInteract() {
    if (this.dialogVisible) {
      this.dialogBox.setVisible(false);
      this.dialogVisible = false;
      return;
    }

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < 60) {
        const dialog = npc.getData('dialog') as string;
        this.dialogText.setText(dialog);
        this.dialogBox.setVisible(true);
        this.dialogVisible = true;
        return;
      }
    }

    for (const zone of this.questZones) {
      const zoneBody = zone.body as Phaser.Physics.Arcade.StaticBody;
      if (zone.body) {
        const bounds = new Phaser.Geom.Rectangle(zoneBody.x, zoneBody.y, zoneBody.width, zoneBody.height);
        if (bounds.contains(this.player.x, this.player.y)) {
          const quest = zone.getData('quest') as string;
          const step = zone.getData('step') as number;
          this.startQuest(quest, step);
          return;
        }
      }
    }
  }

  private startQuest(questId: string, step: number) {
    const messages: Record<string, string[]> = {
      'dying-forest': [
        'Quest Started: The Dying Forest\nInvestigate the dead trees to find the cause.',
        'You found evidence of illegal logging!\nReport to the Ranger.',
        'The Ranger confirms illegal logging.\nTime to take action!',
      ],
      'waste-invasion': [
        'Quest Started: Waste Invasion\nCollect and categorize the waste.',
      ],
    };

    const steps = messages[questId] || ['Unknown quest step'];
    const msg = steps[Math.min(step, steps.length - 1)];

    this.dialogText.setText(msg);
    this.dialogBox.setVisible(true);
    this.dialogVisible = true;
  }
}
