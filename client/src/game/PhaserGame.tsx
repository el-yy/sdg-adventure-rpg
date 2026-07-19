import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { gameConfig } from './config';

interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  worldId: string;
  currentActiveScene?: (scene: Phaser.Scene) => void;
}

const sceneKeys: Record<string, string> = {
  forest: 'ForestWorld',
  health: 'HealthWorld',
  education: 'EducationWorld',
  city: 'CityWorld',
};

const PhaserGame = ({ worldId, currentActiveScene }: PhaserGameProps) => {
  const gameRef = useRef<IRefPhaserGame>({ game: null, scene: null });

  useEffect(() => {
    if (gameRef.current.game) return;
    const refs = gameRef.current;

    const game = new Phaser.Game({
      ...gameConfig,
    });

    refs.game = game;

    return () => {
      if (refs.game) {
        refs.game.destroy(true);
        refs.game = null;
        refs.scene = null;
      }
    };
  }, []);

  useEffect(() => {
    const onSceneReady = (scene: Phaser.Scene) => {
      gameRef.current.scene = scene;
      currentActiveScene?.(scene);
      if (scene.scene.key === 'BootScene') {
        const sceneKey = sceneKeys[worldId];
        if (sceneKey) scene.scene.start(sceneKey);
      }
    };

    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.off('current-scene-ready', onSceneReady);
    };
  }, [currentActiveScene, worldId]);

  return <div id="game-container" />;
};

export default PhaserGame;
export type { IRefPhaserGame };
