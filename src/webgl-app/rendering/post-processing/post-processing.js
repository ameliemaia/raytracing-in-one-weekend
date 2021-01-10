import { OrthographicCamera, RGBAFormat, WebGLRenderTarget } from 'three';
import { GUI } from 'dat.gui';
import { bigTriangle } from '../../utils/geometry';
import { createRenderTarget } from '../render-target';
import { getRenderBufferSize } from '../resize';
import TransitionPass from './passes/transition-pass/transition-pass';
import FinalPass from './passes/final-pass/final-pass';
import EmptyScene from '../../scenes/empty/empty-scene';
import renderer from '../renderer';
import BaseScene from '../../scenes/base/base-scene';
import CopyPass from './passes/copy-pass/copy-pass';
import DenoisePass from './passes/denoise-pass/denoise-pass';
import { MAIN_SCENE_ID } from '../../scenes/main/main-scene';

export default class PostProcessing {
  gui: GUI;
  camera: OrthographicCamera;
  renderTargetTransitionA: WebGLRenderTarget;
  renderTargetTransitionB: WebGLRenderTarget;
  renderTargetDenoise: WebGLRenderTarget;
  renderTargetDenoisePrev: WebGLRenderTarget;
  renderTargetDenoiseCombined: WebGLRenderTarget;
  transitionPass: TransitionPass;
  finalPass: FinalPass;
  currentScene: BaseScene;
  denoisePass: DenoisePass;
  lastPass: BaseScene;
  copyPass: CopyPass;
  sceneA: BaseScene;
  sceneB: BaseScene;

  constructor(gui: GUI) {
    this.gui = gui;
    // Create gui
    // Create big triangle geometry, faster than using quad
    const geometry = bigTriangle();
    // Post camera
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // Setup render targets
    const { width, height } = getRenderBufferSize();
    const options = { stencilBuffer: false, format: RGBAFormat };
    this.renderTargetTransitionA = createRenderTarget(width, height, options);
    this.renderTargetTransitionB = createRenderTarget(width, height, options);
    this.renderTargetDenoise = createRenderTarget(width, height, options);
    this.renderTargetDenoisePrev = createRenderTarget(width, height, options);
    this.renderTargetDenoiseCombined = createRenderTarget(width, height, options);

    // Create passes
    this.transitionPass = new TransitionPass(this.gui, geometry, this.camera);
    this.finalPass = new FinalPass(this.gui, geometry, this.camera);
    this.denoisePass = new DenoisePass(this.gui, geometry, this.camera);
    this.copyPass = new CopyPass(this.gui, geometry, this.camera);

    this.transitionPass.on('complete', () => {
      if (this.sceneB.id === MAIN_SCENE_ID) {
        this.denoisePass.active = true;
      }
    });

    // Create empty scenes
    const sceneA = new EmptyScene('post scene a', 0x000000);
    const sceneB = new EmptyScene('post scene b', 0x000000);
    sceneA.setup();
    sceneB.setup();

    this.setScenes(sceneA, sceneB);
    this.resize();
  }

  /**
   * Set the two main scenes used for the transition pass
   *
   * @param {BaseScene} sceneA
   * @param {BaseScene} sceneB
   * @memberof PostProcessing
   */
  setScenes(sceneA: BaseScene, sceneB: BaseScene) {
    this.sceneA = sceneA;
    this.sceneB = sceneB;
  }

  /**
   * Resize handler for passes and render targets
   *
   * @memberof PostProcessing
   */
  resize() {
    // const scale = settings.devCamera ? settings.viewportPreviewScale : 1;
    let { width, height } = getRenderBufferSize();

    // width *= scale;
    // height *= scale;
    this.renderTargetTransitionA.setSize(width, height);
    this.renderTargetTransitionB.setSize(width, height);
    this.renderTargetDenoise.setSize(width, height);
    this.renderTargetDenoisePrev.setSize(width, height);
    this.renderTargetDenoiseCombined.setSize(width, height);
    this.transitionPass.resize(width, height);
    this.denoisePass.resize(width, height);
    this.copyPass.resize(width, height);
    this.finalPass.resize(width, height);
  }

  /**
   * Render passes and output to screen
   *
   * @param {Number} delta
   * @memberof PostProcessing
   */
  render(delta: number) {
    // Stop rendering past x many passes
    if (this.denoisePass.pauseRendering()) {
      return;
    }

    // Determine the current scene based on the transition pass value
    this.currentScene = this.transitionPass.mesh.material.uniforms.transition.value === 0 ? this.sceneA : this.sceneB;
    this.lastPass = this.currentScene;

    this.currentScene.update(delta);

    // // If the transition pass is active
    if (this.transitionPass.active) {
      this.transitionPass.render(
        this.sceneA,
        this.sceneB,
        this.renderTargetTransitionA,
        this.renderTargetTransitionB,
        delta
      );
      this.lastPass = this.transitionPass;
    } else {
      // Otherwise we just render the current scene
      renderer.setClearColor(this.currentScene.clearColor);
      this.currentScene.update(delta);
    }

    if (this.denoisePass.active) {
      this.denoisePass.render(
        this.lastPass,
        this.renderTargetDenoise,
        this.renderTargetDenoisePrev,
        this.renderTargetDenoiseCombined
      );
      // Copy combined result to prev textuer
      this.copyPass.render(this.renderTargetDenoisePrev, this.renderTargetDenoiseCombined);
      // this.copyPass.render(this.renderTargetB, this.renderTargetC, true);
    } else {
      renderer.setRenderTarget(this.renderTargetDenoiseCombined);
      renderer.render(this.lastPass.scene, this.lastPass.camera);
      renderer.setRenderTarget(null);
    }

    // // Render the final pass which contains all the post fx
    this.finalPass.render(this.lastPass, this.renderTargetDenoiseCombined, delta);
  }
}
