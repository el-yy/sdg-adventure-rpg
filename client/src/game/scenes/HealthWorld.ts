import { WORLD_MAPS } from '../data/worldMaps';
import { BaseWorldScene } from './BaseWorldScene';

export class HealthWorld extends BaseWorldScene {
  protected readonly mapDefinition = WORLD_MAPS.health;

  constructor() {
    super(WORLD_MAPS.health.sceneKey);
  }
}
