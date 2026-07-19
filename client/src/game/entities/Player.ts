import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public speed = 160;
  public stats = {
    environmentalKnowledge: 10,
    healthAwareness: 10,
    problemSolving: 10,
    communityImpact: 10,
  };

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(1.5);

    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W)!,
      A: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A)!,
      S: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S)!,
      D: scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)!,
    };

    this.createAnimations();
  }

  private createAnimations() {
    this.scene.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
    });
  }

  update() {
    if (!this.cursors || !this.wasd) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-this.speed);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(this.speed);
      this.setFlipX(false);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(this.speed);
    }

    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      this.anims.play('idle', true);
    }
  }

  getPublicState() {
    return {
      x: this.x,
      y: this.y,
      stats: { ...this.stats },
    };
  }
}
