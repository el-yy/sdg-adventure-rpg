import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { gameConfig } from './config';

interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  currentActiveScene?: (scene: Phaser.Scene) => void;
}

const PhaserGame = ({ currentActiveScene }: PhaserGameProps) => {
  const gameRef = useRef<IRefPhaserGame>({ game: null, scene: null });

  useEffect(() => {
    if (gameRef.current.game) return;

    const game = new Phaser.Game({
      ...gameConfig,
    });

    gameRef.current.game = game;

    return () => {
      if (gameRef.current.game) {
        gameRef.current.game.destroy(true);
        gameRef.current.game = null;
        gameRef.current.scene = null;
      }
    };
  }, []);

  useEffect(() => {
    const onSceneReady = (scene: Phaser.Scene) => {
      gameRef.current.scene = scene;
      currentActiveScene?.(scene);
    };

    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.off('current-scene-ready', onSceneReady);
    };
  }, [currentActiveScene]);

  useEffect(() => {
    const sceneKeys: Record<string, string> = {
      forest: 'ForestWorld',
      health: 'HealthWorld',
      education: 'EducationWorld',
      city: 'CityWorld',
    };

    const loadWorld = (worldId: string) => {
      const sceneKey = sceneKeys[worldId];
      if (sceneKey && gameRef.current.game) {
        gameRef.current.game.scene.start(sceneKey);
      }
    };

    EventBus.on('load-world', loadWorld);
    return () => {
      EventBus.off('load-world', loadWorld);
    };
  }, []);

  return <div id="game-container" style={{ width: '100%', height: '100%' }} />;
};

export default PhaserGame;
export type { IRefPhaserGame };
