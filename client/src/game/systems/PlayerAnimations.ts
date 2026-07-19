import Phaser from 'phaser';

const animationRows = {
  down: [0, 3],
  left: [4, 7],
  right: [8, 11],
  up: [12, 15],
} as const;

export function ensurePlayerAnimations(scene: Phaser.Scene): void {
  for (const [direction, [start, end]] of Object.entries(animationRows)) {
    const key = `walk-${direction}`;
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers('player-sheet', { start, end }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}

export function updatePlayerAnimation(
  player: Phaser.Physics.Arcade.Sprite,
  velocityX: number,
  velocityY: number,
): void {
  if (velocityX === 0 && velocityY === 0) {
    player.anims.stop();
    return;
  }

  if (Math.abs(velocityX) > Math.abs(velocityY)) {
    player.anims.play(velocityX < 0 ? 'walk-left' : 'walk-right', true);
  } else {
    player.anims.play(velocityY < 0 ? 'walk-up' : 'walk-down', true);
  }
}
