import Phaser from 'phaser';

export type WorldTheme = 'forest' | 'health' | 'education' | 'city';

const treeLayouts: Record<WorldTheme, Array<[number, number, number]>> = {
  forest: [[70,80,1.35],[150,120,1],[250,70,1.15],[1050,90,1.2],[1130,170,1],[70,730,1.1],[160,820,1.3],[1080,730,1.25],[1140,840,1.1],[310,820,.9],[910,80,.9],[980,820,1],[150,245,.85],[430,190,.95],[1035,250,.9],[170,650,.9],[775,610,.8],[1080,560,.9]],
  health: [[80,90,1],[180,780,.9],[1060,90,1],[1120,760,1],[880,780,.8],[300,90,.8],[150,270,.75],[1050,300,.8],[760,710,.7]],
  education: [[80,90,1],[170,790,.9],[1080,100,1],[1100,780,1],[920,100,.8],[340,800,.8],[150,260,.75],[1030,300,.8],[760,730,.7]],
  city: [[80,100,.8],[1120,100,.8],[80,800,.8],[1120,800,.8],[340,100,.7],[860,800,.7],[160,330,.65],[1050,340,.65]],
};

const buildingLayouts: Record<WorldTheme, Array<[number, number, number]>> = {
  forest: [[600,135,2]],
  health: [[300,175,2.4],[880,185,2.1],[600,720,2]],
  education: [[280,170,2.2],[700,145,2.4],[920,680,2]],
  city: [[220,165,2.2],[520,155,2.4],[840,170,2.1],[980,650,2.3],[350,720,2]],
};

function addPath(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number) {
  scene.add.rectangle(x, y, width + 8, height + 8, 0x8b5a2b).setDepth(-1);
  scene.add.rectangle(x, y, width, height, color).setDepth(0);
  const count = Math.max(3, Math.floor((width + height) / 90));
  for (let i = 0; i < count; i++) {
    const px = x - width / 2 + 18 + ((i * 73) % Math.max(24, width - 36));
    const py = y - height / 2 + 12 + ((i * 47) % Math.max(20, height - 24));
    scene.add.rectangle(px, py, 4, 2, 0x9a6938, .55).setDepth(1);
  }
}

export function buildCozyEnvironment(scene: Phaser.Scene, theme: WorldTheme): void {
  const groundKey = theme === 'city' ? 'tileset-stone' : 'tileset-grass';
  const ground = scene.add.tileSprite(600, 450, 1200, 900, groundKey).setDepth(-5);
  ground.setTint(theme === 'health' ? 0xb8d9b5 : theme === 'education' ? 0xd8d4a9 : 0xffffff);

  const pathColor = theme === 'city' ? 0xb6a07b : 0xc99b63;
  addPath(scene, 600, 450, 1040, 86, pathColor);
  addPath(scene, 600, 450, 86, 760, pathColor);
  addPath(scene, 300, 270, 70, 300, pathColor);
  addPath(scene, 900, 630, 70, 290, pathColor);

  if (theme === 'forest') {
    scene.add.ellipse(930, 690, 250, 150, 0x346d74).setDepth(-1);
    scene.add.ellipse(930, 684, 215, 120, 0x6fc4d6).setDepth(0);
  }

  buildingLayouts[theme].forEach(([x, y, scale]) => {
    scene.add.image(x, y, 'building').setScale(scale).setDepth(y);
  });
  treeLayouts[theme].forEach(([x, y, scale]) => {
    scene.add.image(x, y, 'tree').setScale(scale).setDepth(y);
  });

  const itemPositions: Array<[number, number]> = [[210,350],[410,560],[760,330],[1020,520],[475,770],[770,760]];
  itemPositions.forEach(([x, y], index) => {
    if (theme === 'city' && index > 2) return;
    scene.add.image(x, y, 'item').setScale(.7).setAlpha(.9).setDepth(y);
  });

  const fenceColor = 0x704329;
  [[600,22,1120,12],[600,878,1120,12],[22,450,12,830],[1178,450,12,830]].forEach(([x,y,w,h]) => {
    scene.add.rectangle(x, y, w, h, fenceColor).setDepth(890);
  });
}
