import BaseScene from '../base/base-scene';
import { VECTOR_ZERO } from '../../utils/math';
import assets from './assets';
import Raytracer from './objects/raytracer/raytracer';
import { postProcessing } from '../../rendering/renderer';
import { Vector3 } from 'three';

export const MAIN_SCENE_ID = 'main';

export default class MainScene extends BaseScene {
  constructor() {
    super({ id: MAIN_SCENE_ID, assets, gui: true, guiOpen: true, controls: true });
    this.cameras.main.position.set(3, 3, 2);
    this.cameras.main.lookAt(new Vector3(0, 0, -1));
    this.control.target.set(0, 0, -1);
  }

  /**
   * Create and setup any objects for the scene
   *
   * @memberof LandingScene
   */
  async createSceneObjects() {
    await new Promise((resolve, reject) => {
      try {
        this.raytracer = new Raytracer(this.gui);
        this.scene.add(this.raytracer.mesh);

        this.control.addEventListener('change', () => {
          postProcessing.denoisePass.reset();
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  resize = (width: number, height: number) => {
    this.cameras.dev.aspect = width / height;
    this.cameras.dev.updateProjectionMatrix();
    this.cameras.main.aspect = width / height;
    this.cameras.main.updateProjectionMatrix();
    this.raytracer.resize(width, height, this.camera);
  };

  /**
   * Update loop
   *
   * @memberof LandingScene
   */
  update = (delta: number) => {
    this.controls.main.update();
    this.raytracer.update(delta, this.camera, this.control);
  };
}
