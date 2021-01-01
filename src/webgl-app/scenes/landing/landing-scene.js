import BaseScene from '../base/base-scene';
import { VECTOR_ZERO } from '../../utils/math';
import assets from './assets';
import Background from '../../objects/background/background';
import Raytracer from './objects/raytracer/raytracer';

export const LANDING_SCENE_ID = 'landing';

export default class LandingScene extends BaseScene {
  constructor() {
    super({ id: LANDING_SCENE_ID, assets, gui: true, guiOpen: true, controls: true });
    this.cameras.main.position.set(0, 0, 60);
    this.cameras.main.lookAt(VECTOR_ZERO);
  }

  /**
   * Create and setup any objects for the scene
   *
   * @memberof LandingScene
   */
  async createSceneObjects() {
    await new Promise((resolve, reject) => {
      try {
        this.background = new Background(this.gui, 100);
        this.scene.add(this.background.mesh);

        this.raytracer = new Raytracer();
        this.scene.add(this.raytracer.mesh);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Update loop
   *
   * @memberof LandingScene
   */
  update = (delta: number) => {
    this.controls.main.update();
  };
}
