import { WORLD_MAPS } from '../data/worldMaps';
import { BaseWorldScene } from './BaseWorldScene';

export class CityWorld extends BaseWorldScene {
  protected readonly mapDefinition = WORLD_MAPS.city;

  constructor() {
    super(WORLD_MAPS.city.sceneKey);
  }
}
