import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import type { WorldMapDefinition, WorldNpcDefinition, WorldQuestZoneDefinition } from '../data/worldMaps';
import { CozyDialog } from '../systems/CozyDialog';
import { renderWorldMap } from '../systems/WorldMapRenderer';

interface NpcRuntime {
  sprite: Phaser.Physics.Arcade.Sprite;
  definition: WorldNpcDefinition;
  prompt: Phaser.GameObjects.Container;
}

interface QuestRuntime {
  zone: Phaser.GameObjects.Zone;
  definition: WorldQuestZoneDefinition;
}

type Direction = 'down' | 'left' | 'right' | 'up';

export abstract class BaseWorldScene extends Phaser.Scene {
  protected abstract readonly mapDefinition: WorldMapDefinition;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private npcs: NpcRuntime[] = [];
  private quests: QuestRuntime[] = [];
  private dialogue!: CozyDialog;
  private facing: Direction = 'down';
  private uiBlocked = false;
  private readonly handleUiOverlay = (blocked: unknown) => {
    this.uiBlocked = Boolean(blocked);
    if (this.uiBlocked && this.player) this.player.setVelocity(0, 0);
  };

  create() {
    const map = renderWorldMap(this, this.mapDefinition);
    this.createAnimations();
    this.createPlayer();
    this.createNpcs();
    this.createQuestZones();
    this.dialogue = new CozyDialog(this, this.mapDefinition.accent);
    this.setupInput();

    this.physics.add.collider(this.player, map.collisions);
    this.cameras.main.setBounds(0, 0, map.worldWidth, map.worldHeight);
    this.cameras.main.setBackgroundColor(this.mapDefinition.background);
    this.cameras.main.startFollow(this.player, true, .11, .11);
    this.cameras.main.setDeadzone(180, 120);
    this.updateCameraZoom(this.scale.width, this.scale.height);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    EventBus.on('ui-overlay-changed', this.handleUiOverlay);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    EventBus.emit('current-scene-ready', this);
  }

  update() {
    if (!this.player || !this.input.keyboard) return;
    if (this.uiBlocked || this.dialogue.visible) {
      this.player.setVelocity(0, 0);
      this.setIdleFrame();
      this.updateDepthAndPrompts();
      if (!this.uiBlocked && Phaser.Input.Keyboard.JustDown(this.wasd.E)) this.dialogue.advance();
      return;
    }

    const speed = 175;
    let velocityX = 0;
    let velocityY = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = speed;
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= .707;
      velocityY *= .707;
    }

    this.player.setVelocity(velocityX, velocityY);
    this.updatePlayerAnimation(velocityX, velocityY);
    this.updateDepthAndPrompts();
    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) this.interact();
  }

  private createAnimations() {
    (['down', 'left', 'right', 'up'] as Direction[]).forEach(direction => {
      const key = `cozy-walk-${direction}`;
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: [
          { key: 'cozy-characters', frame: `player-${direction}-idle` },
          { key: 'cozy-characters', frame: `player-${direction}-walk` },
        ],
        frameRate: 6,
        repeat: -1,
        yoyo: true,
      });
    });
  }

  private createPlayer() {
    const { x, y } = this.mapDefinition.spawn;
    this.playerShadow = this.add.ellipse(x, y - 3, 46, 17, 0x173520, .28).setDepth(y - 1);
    this.player = this.physics.add.sprite(x, y, 'cozy-characters', 'player-down-idle')
      .setOrigin(.5, 1)
      .setDisplaySize(58, 82)
      .setCollideWorldBounds(true)
      .setDepth(y);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(62, 42).setOffset(21, 96);
  }

  private createNpcs() {
    this.mapDefinition.npcs.forEach(definition => {
      const shadow = this.add.ellipse(definition.x, definition.y - 3, 50, 17, 0x173520, .25).setDepth(definition.y - 1);
      const sprite = this.physics.add.sprite(definition.x, definition.y, 'cozy-characters', definition.frame)
        .setOrigin(.5, 1)
        .setDisplaySize(74, 108)
        .setImmovable(true)
        .setDepth(definition.y);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(70, 42).setOffset((sprite.frame.width - 70) / 2, sprite.frame.height - 44);
      this.physics.add.collider(this.player, sprite);

      const bubble = this.add.image(0, 0, 'cozy-characters', 'icon-chat').setDisplaySize(52, 38);
      const key = this.add.text(0, -2, 'E', {
        fontSize: '12px', color: '#49311f', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(.5);
      const label = this.add.text(0, 26, definition.name, {
        fontSize: '10px', color: '#fff4c7', backgroundColor: '#402719dd',
        padding: { x: 6, y: 3 }, fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(.5);
      const prompt = this.add.container(definition.x, definition.y - 126, [bubble, key, label])
        .setDepth(definition.y + 4)
        .setVisible(false);
      sprite.setData('shadow', shadow);
      this.npcs.push({ sprite, definition, prompt });
    });
  }

  private createQuestZones() {
    this.mapDefinition.questZones.forEach(definition => {
      const zone = this.add.zone(definition.x, definition.y, definition.width, definition.height);
      this.physics.add.existing(zone, true);
      const marker = this.add.image(definition.x, definition.y - definition.height / 2 - 22, 'cozy-characters', 'icon-quest')
        .setDisplaySize(30, 48)
        .setDepth(definition.y + 2);
      this.tweens.add({ targets: marker, y: marker.y - 8, duration: 760, ease: 'Sine.inOut', yoyo: true, repeat: -1 });
      this.quests.push({ zone, definition });
    });
  }

  private setupInput() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };
  }

  private updatePlayerAnimation(velocityX: number, velocityY: number) {
    if (velocityX === 0 && velocityY === 0) {
      this.setIdleFrame();
      return;
    }
    if (Math.abs(velocityX) > Math.abs(velocityY)) this.facing = velocityX < 0 ? 'left' : 'right';
    else this.facing = velocityY < 0 ? 'up' : 'down';
    this.player.anims.play(`cozy-walk-${this.facing}`, true);
  }

  private setIdleFrame() {
    this.player.anims.stop();
    this.player.setFrame(`player-${this.facing}-idle`);
  }

  private updateDepthAndPrompts() {
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y - 3).setDepth(this.player.y - 1);
    this.npcs.forEach(({ sprite, prompt }) => {
      const nearby = !this.dialogue?.visible
        && !this.uiBlocked
        && Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y) < 112;
      prompt.setPosition(sprite.x, sprite.y - 126).setDepth(sprite.y + 4).setVisible(nearby);
    });
  }

  private interact() {
    const closestNpc = this.npcs
      .map(runtime => ({ runtime, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, runtime.sprite.x, runtime.sprite.y) }))
      .filter(entry => entry.distance < 112)
      .sort((a, b) => a.distance - b.distance)[0]?.runtime;
    if (closestNpc) {
      this.dialogue.show({
        speaker: closestNpc.definition.name,
        text: closestNpc.definition.dialog,
        portrait: closestNpc.definition.portrait,
      });
      return;
    }

    const quest = this.quests.find(({ zone }) => zone.getBounds().contains(this.player.x, this.player.y));
    if (quest) this.dialogue.show({ speaker: 'Quest Journal', text: quest.definition.message, portrait: 'portrait-seed-keeper' });
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.updateCameraZoom(gameSize.width, gameSize.height);
  }

  private updateCameraZoom(width: number, height: number) {
    const fit = Math.min(width / 960, height / 640);
    const zoom = Phaser.Math.Clamp(Math.floor(fit * 2) / 2, 1, 2);
    this.cameras.main.setZoom(zoom);
  }

  private shutdown() {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    EventBus.off('ui-overlay-changed', this.handleUiOverlay);
  }
}
