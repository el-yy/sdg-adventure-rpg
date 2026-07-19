import Phaser from 'phaser';

export function createCozyDialog(scene: Phaser.Scene, accent: number) {
  const { width, height } = scene.scale;
  const panelWidth = Math.min(820, width - 36);
  const panelHeight = 126;
  const centerY = height - panelHeight / 2 - 18;
  const container = scene.add.container(0, 0).setScrollFactor(0).setDepth(2000).setVisible(false);
  const shadow = scene.add.rectangle(width / 2, centerY + 7, panelWidth + 8, panelHeight + 8, 0x2b190f, .85);
  const frame = scene.add.rectangle(width / 2, centerY, panelWidth, panelHeight, 0x6d3f20, .98).setStrokeStyle(4, 0x382216);
  const paper = scene.add.rectangle(width / 2, centerY, panelWidth - 18, panelHeight - 18, 0xf5dfaa, 1).setStrokeStyle(2, accent);
  const text = scene.add.text(width / 2 - panelWidth / 2 + 28, centerY - 38, '', {
    fontSize: '15px', color: '#3d291c', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    wordWrap: { width: panelWidth - 56 }, lineSpacing: 5,
  });
  const hint = scene.add.text(width / 2 + panelWidth / 2 - 28, centerY + 40, 'E  continue', {
    fontSize: '10px', color: '#725033', fontFamily: 'monospace', fontStyle: 'bold',
  }).setOrigin(1, .5);
  container.add([shadow, frame, paper, text, hint]);
  return { container, text };
}
