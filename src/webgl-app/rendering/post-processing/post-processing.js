import { OrthographicCamera, RGBAFormat, WebGLRenderTarget } from 'three';
import { GUI } from 'dat.gui';
import { bigTriangle } from '../../utils/geometry';
import { createRenderTarget } from '../render-target';
import { getRenderBufferSize } from '../resize';
import TransitionPass from './passes/transition-pass/transition-pass';
import FinalPass from './passes/final-pass/final-pass';
import EmptyScene from '../../scenes/empty/empty-scene';
import renderer from '../renderer';
import settings from '../../settings';
import BaseScene from '../../scenes/base/base-scene';
import CopyPass from './passes/copy-pass/copy-pass';
import DenoisePass from './passes/denoise-pass/denoise-pass';
import RenderTargetHelper from '../../utils/render-target-helper';
import { saveAs } from 'file-saver';

export default class PostProcessing {
  gui: GUI;
  camera: OrthographicCamera;
  renderTargetA: WebGLRenderTarget;
  renderTargetB: WebGLRenderTarget;
  renderTargetC: WebGLRenderTarget;
  transitionPass: TransitionPass;
  finalPass: FinalPass;
  currentScene: BaseScene;
  lastPass: mixed;
  sceneA: BaseScene;
  sceneB: BaseScene;

  constructor(gui: GUI) {
    // Create gui
    this.gui = gui.addFolder('post processing');
    // this.gui.open();
    // Create big triangle geometry, faster than using quad
    const geometry = bigTriangle();
    // Post camera
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // Setup render targets
    const { width, height } = getRenderBufferSize();
    const options = { stencilBuffer: false, format: RGBAFormat };
    this.renderTargetA = createRenderTarget(width, height, options);
    this.renderTargetB = createRenderTarget(width, height, options);
    this.renderTargetC = createRenderTarget(width, height, options);
    this.renderTargetD = createRenderTarget(width, height, options);

    // Create passes
    this.transitionPass = new TransitionPass(this.gui, geometry, this.camera);
    this.finalPass = new FinalPass(this.gui, geometry, this.camera);
    this.denoisePass = new DenoisePass(this.gui, geometry, this.camera);
    this.copyPass = new CopyPass(this.gui, geometry, this.camera);

    // this.renderTargetHelper0 = new RenderTargetHelper(this.renderTargetB, { left: 80 });
    // this.renderTargetHelper1 = new RenderTargetHelper(this.renderTargetC, { left: 850 });

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
    this.renderTargetA.setSize(width, height);
    this.renderTargetB.setSize(width, height);
    this.renderTargetC.setSize(width, height);
    this.renderTargetD.setSize(width, height);
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
    // Determine the current scene based on the transition pass value
    this.currentScene = this.transitionPass.mesh.material.uniforms.transition.value === 0 ? this.sceneA : this.sceneB;
    this.lastPass = this.currentScene;

    this.currentScene.update(delta);

    // Render scene into Render Target A
    renderer.setRenderTarget(this.renderTargetA);
    renderer.render(this.currentScene.scene, this.currentScene.camera);
    renderer.setRenderTarget(null);

    this.denoisePass.render(this.renderTargetA, this.renderTargetB, this.renderTargetC);

    // Render both current and previous textures into a
    // combined render target
    this.copyPass.render(this.renderTargetB, this.renderTargetC);
    this.copyPass.render(this.renderTargetB, this.renderTargetC, true);

    // this.renderTargetHelper0.update();
    // this.renderTargetHelper1.update();

    // Copy this target for the previous texture

    // // If the transition pass is active
    // if (this.transitionPass.active) {
    //   this.transitionPass.render(this.sceneA, this.sceneB, this.renderTargetA, this.renderTargetB, delta);
    //   this.lastPass = this.transitionPass;
    // } else {
    //   // Otherwise we just render the current scene
    //   renderer.setClearColor(this.currentScene.clearColor);
    //   this.currentScene.update(delta);
    // }

    // // Render the final pass which contains all the post fx
    // this.finalPass.render(this.lastPass, this.renderTargetC, delta);
  }
}
