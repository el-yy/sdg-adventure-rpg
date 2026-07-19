import { WORLD_MAPS } from '../data/worldMaps';
import { BaseWorldScene } from './BaseWorldScene';

export class ForestWorld extends BaseWorldScene {
  protected readonly mapDefinition = WORLD_MAPS.forest;

  constructor() {
    super(WORLD_MAPS.forest.sceneKey);
  }
}
