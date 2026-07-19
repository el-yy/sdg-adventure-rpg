import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import type { WorldMapDefinition, WorldNpcDefinition } from '../data/worldMaps';
import type { QuestInteractionEvent, QuestNpcMarkerKind, QuestRuntimeState } from '../types/questRuntime';
import { CozyDialog } from '../systems/CozyDialog';
import { renderWorldMap } from '../systems/WorldMapRenderer';

interface NpcRuntime {
  sprite: Phaser.Physics.Arcade.Sprite;
  definition: WorldNpcDefinition;
  prompt: Phaser.GameObjects.Container;
  promptLabel: Phaser.GameObjects.Text;
  marker?: Phaser.GameObjects.Container;
  questAction?: QuestNpcMarkerKind;
}

interface ObjectiveRuntime {
  object: Phaser.GameObjects.Container;
  targetId: string;
  itemId?: string;
  kind: QuestInteractionEvent['kind'];
}

type Direction = 'down' | 'left' | 'right' | 'up';

export abstract class BaseWorldScene extends Phaser.Scene {
  protected abstract readonly mapDefinition: WorldMapDefinition;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private npcs: NpcRuntime[] = [];
  private objectives: ObjectiveRuntime[] = [];
  private dialogue!: CozyDialog;
  private facing: Direction = 'down';
  private uiBlocked = false;
  private hasActiveQuest = false;
  private readonly handleUiOverlay = (blocked: unknown) => {
    this.uiBlocked = Boolean(blocked);
    if (this.uiBlocked && this.player) this.player.setVelocity(0, 0);
  };
  private readonly handleQuestRuntime = (state: QuestRuntimeState) => {
    if (state.worldId === this.mapDefinition.id) this.applyQuestRuntime(state);
  };

  create() {
    const map = renderWorldMap(this, this.mapDefinition);
    this.createAnimations();
    this.createPlayer();
    this.createNpcs();
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
    EventBus.on('quest-runtime-update', this.handleQuestRuntime);
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
      this.npcs.push({ sprite, definition, prompt, promptLabel: label });
    });
  }

  private applyQuestRuntime(state: QuestRuntimeState) {
    this.hasActiveQuest = state.hasActiveQuest;
    this.npcs.forEach(runtime => {
      runtime.marker?.destroy(true);
      runtime.marker = undefined;
      runtime.questAction = undefined;
      runtime.promptLabel.setText(runtime.definition.name);
    });
    state.npcMarkers.forEach(marker => {
      const runtime = this.npcs.find(npc => npc.definition.id === marker.npcId);
      if (!runtime) return;
      const symbol = marker.kind === 'offer' ? '!' : '?';
      const glow = this.add.circle(0, 0, 22, marker.kind === 'offer' ? 0xf8cf61 : 0x8fce73, .95)
        .setStrokeStyle(4, 0x5a351d);
      const text = this.add.text(0, -1, symbol, {
        fontFamily: 'Georgia, serif', fontSize: '25px', fontStyle: 'bold', color: '#4b2d19',
      }).setOrigin(.5);
      runtime.marker = this.add.container(runtime.sprite.x, runtime.sprite.y - 150, [glow, text])
        .setDepth(runtime.sprite.y + 5);
      runtime.questAction = marker.kind;
      runtime.promptLabel.setText(marker.kind === 'offer' ? `Quest from ${runtime.definition.name}` : `Continue with ${runtime.definition.name}`);
      this.tweens.add({ targets: runtime.marker, y: runtime.marker.y - 7, duration: 720, ease: 'Sine.inOut', yoyo: true, repeat: -1 });
    });

    this.objectives.forEach(runtime => runtime.object.destroy(true));
    this.objectives = [];
    if (!state.objective) return;
    const objective = state.objective;
    if (objective.stepType === 'collect') {
      const offsets = [{ x: -54, y: 26 }, { x: 16, y: -30 }, { x: 62, y: 35 }];
      offsets.forEach((offset, index) => {
        const itemId = `${objective.stepId}-${index + 1}`;
        if (objective.collectedIds.includes(itemId)) return;
        this.objectives.push({
          object: this.createObjectiveObject(objective.x + offset.x, objective.y + offset.y, 'Collect', true),
          targetId: objective.targetId,
          itemId,
          kind: 'collectible',
        });
      });
      return;
    }
    this.objectives.push({
      object: this.createObjectiveObject(objective.x, objective.y, objective.stepType === 'explore' ? 'Inspect' : 'Begin', false),
      targetId: objective.targetId,
      kind: 'objective',
    });
  }

  private createObjectiveObject(x: number, y: number, action: string, collectible: boolean) {
    const glow = this.add.circle(0, 6, collectible ? 27 : 38, 0xffd66b, .22)
      .setStrokeStyle(3, 0xffe59a, .9);
    const icon = this.add.image(0, collectible ? 2 : -5, 'cozy-characters', 'icon-quest')
      .setDisplaySize(collectible ? 25 : 31, collectible ? 39 : 48);
    const prompt = this.add.text(0, 39, `E  ${action}`, {
      fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'bold', color: '#4b2d19',
      backgroundColor: '#fff0bfed', padding: { x: 7, y: 4 },
    }).setOrigin(.5).setVisible(false).setData('quest-prompt', true);
    const object = this.add.container(x, y, [glow, icon, prompt]).setDepth(y + 2);
    this.tweens.add({ targets: glow, alpha: .08, scale: 1.18, duration: 820, yoyo: true, repeat: -1 });
    return object;
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
    this.objectives.forEach(({ object }) => {
      const nearby = !this.dialogue?.visible && !this.uiBlocked
        && Phaser.Math.Distance.Between(this.player.x, this.player.y, object.x, object.y) < 100;
      object.list.forEach(child => {
        if (child instanceof Phaser.GameObjects.Text && child.getData('quest-prompt')) child.setVisible(nearby);
      });
    });
  }

  private interact() {
    const closestNpc = this.npcs
      .map(runtime => ({ runtime, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, runtime.sprite.x, runtime.sprite.y) }))
      .filter(entry => entry.distance < 112)
      .sort((a, b) => a.distance - b.distance)[0]?.runtime;
    if (closestNpc) {
      if (closestNpc.questAction || this.hasActiveQuest) {
        EventBus.emit('quest-interaction', { kind: 'npc', npcId: closestNpc.definition.id } satisfies QuestInteractionEvent);
        return;
      }
      this.dialogue.show({
        speaker: closestNpc.definition.name,
        text: closestNpc.definition.dialog,
        portrait: closestNpc.definition.portrait,
      });
      return;
    }

    const objective = this.objectives
      .map(runtime => ({ runtime, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, runtime.object.x, runtime.object.y) }))
      .filter(entry => entry.distance < 100)
      .sort((a, b) => a.distance - b.distance)[0]?.runtime;
    if (!objective) return;
    const event: QuestInteractionEvent = objective.kind === 'collectible'
      ? { kind: 'collectible', targetId: objective.targetId, itemId: objective.itemId! }
      : { kind: 'objective', targetId: objective.targetId };
    EventBus.emit('quest-interaction', event);
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
    EventBus.off('quest-runtime-update', this.handleQuestRuntime);
  }
}
