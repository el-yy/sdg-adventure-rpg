import Phaser from 'phaser';

export function updateNpcPrompts(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite): void {
  const npcs = scene.children.list.filter(child => child.getData?.('name')) as Phaser.Physics.Arcade.Sprite[];
  npcs.forEach(npc => {
    const prompt = npc.getData('nameTag') as Phaser.GameObjects.Text | undefined;
    if (!prompt) return;
    const nearby = Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y) < 95;
    prompt.setPosition(npc.x, npc.y - 34).setVisible(nearby).setDepth(npc.y + 2);
  });
}
