import { WORLD_MAPS } from '../data/worldMaps';
import { BaseWorldScene } from './BaseWorldScene';

export class EducationWorld extends BaseWorldScene {
  protected readonly mapDefinition = WORLD_MAPS.education;

  constructor() {
    super(WORLD_MAPS.education.sceneKey);
  }
}
