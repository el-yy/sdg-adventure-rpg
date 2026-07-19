import Phaser from 'phaser';

export interface DialogueContent {
  speaker: string;
  text: string;
  portrait?: string;
}

export class CozyDialog {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Rectangle;
  private readonly frame: Phaser.GameObjects.Rectangle;
  private readonly paper: Phaser.GameObjects.Rectangle;
  private readonly portraitBack: Phaser.GameObjects.Rectangle;
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly speaker: Phaser.GameObjects.Text;
  private readonly text: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private timer?: Phaser.Time.TimerEvent;
  private fullText = '';
  private characterIndex = 0;

  constructor(scene: Phaser.Scene, accent: number) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(5000).setVisible(false);
    this.shadow = scene.add.rectangle(0, 0, 100, 100, 0x25150c, .88);
    this.frame = scene.add.rectangle(0, 0, 100, 100, 0x75431f, 1).setStrokeStyle(5, 0x321c10);
    this.paper = scene.add.rectangle(0, 0, 100, 100, 0xf7e4b4, 1).setStrokeStyle(2, accent);
    this.portraitBack = scene.add.rectangle(0, 0, 108, 108, 0x432718, 1).setStrokeStyle(3, 0xc69552);
    this.portrait = scene.add.image(0, 0, 'cozy-characters', 'portrait-ranger').setOrigin(.5, .62);
    this.speaker = scene.add.text(0, 0, '', {
      fontSize: '17px', color: '#fff1bd', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      backgroundColor: '#61381f', padding: { x: 12, y: 5 },
    });
    this.text = scene.add.text(0, 0, '', {
      fontSize: '17px', color: '#3f2a1c', fontFamily: 'Georgia, serif',
      lineSpacing: 7, wordWrap: { width: 500 },
    });
    this.hint = scene.add.text(0, 0, 'E  continue', {
      fontSize: '11px', color: '#795434', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(1, .5);
    this.container.add([
      this.shadow, this.frame, this.paper, this.portraitBack,
      this.portrait, this.speaker, this.text, this.hint,
    ]);
    this.layout(scene.scale.width, scene.scale.height);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.timer?.destroy();
    });
  }

  get visible() {
    return this.container.visible;
  }

  show(content: DialogueContent) {
    this.timer?.destroy();
    this.fullText = content.text;
    this.characterIndex = 0;
    this.speaker.setText(content.speaker);
    this.portrait.setFrame(content.portrait ?? 'portrait-ranger');
    this.text.setText('');
    this.container.setVisible(true);
    this.timer = this.scene.time.addEvent({
      delay: 18,
      repeat: Math.max(0, this.fullText.length - 1),
      callback: () => {
        this.characterIndex += 1;
        this.text.setText(this.fullText.slice(0, this.characterIndex));
      },
    });
  }

  advance(): boolean {
    if (!this.visible) return false;
    if (this.characterIndex < this.fullText.length) {
      this.timer?.destroy();
      this.characterIndex = this.fullText.length;
      this.text.setText(this.fullText);
      return false;
    }
    this.hide();
    return true;
  }

  hide() {
    this.timer?.destroy();
    this.container.setVisible(false);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.layout(gameSize.width, gameSize.height);
  }

  private layout(width: number, height: number) {
    const compact = width < 620;
    const panelWidth = Math.min(900, width - (compact ? 18 : 42));
    const panelHeight = compact ? 142 : 158;
    const centerX = width / 2;
    const centerY = height - panelHeight / 2 - (compact ? 10 : 20);
    const portraitSize = compact ? 82 : 112;
    const left = centerX - panelWidth / 2;
    const textLeft = left + portraitSize + (compact ? 30 : 42);

    this.shadow.setPosition(centerX, centerY + 7).setSize(panelWidth + 8, panelHeight + 8);
    this.frame.setPosition(centerX, centerY).setSize(panelWidth, panelHeight);
    this.paper.setPosition(centerX, centerY).setSize(panelWidth - 18, panelHeight - 18);
    this.portraitBack.setPosition(left + portraitSize / 2 + 14, centerY + 4).setSize(portraitSize, portraitSize);
    this.portrait.setPosition(left + portraitSize / 2 + 14, centerY + 20).setDisplaySize(portraitSize - 8, portraitSize - 8);
    this.speaker.setPosition(textLeft, centerY - panelHeight / 2 + 19);
    this.text.setPosition(textLeft, centerY - 24).setWordWrapWidth(panelWidth - portraitSize - (compact ? 62 : 86));
    this.text.setFontSize(compact ? 14 : 17);
    this.hint.setPosition(centerX + panelWidth / 2 - 24, centerY + panelHeight / 2 - 22);
  }
}
