import { GUI } from 'dat.gui';
import {
  BufferGeometry,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget
} from 'three';
import BaseScene from '../../../../scenes/base/base-scene';
import renderer from '../../../renderer';
import { getRenderBufferSize } from '../../../resize';
import { vertexShader, fragmentShader } from './shader.glsl';

export default class DenoisePass {
  active: boolean = false;

  passes: number = 0;

  maxPasses: number = 2000;

  scene: Scene;

  camera: PerspectiveCamera;

  mesh: Mesh;

  gui: GUI;

  constructor(gui: GUI, geometry: BufferGeometry, camera: OrthographicCamera) {
    this.gui = gui.addFolder('denoise pass');
    this.gui.open();
    this.scene = new Scene();
    this.camera = camera;
    const { width, height } = getRenderBufferSize();
    const material = new ShaderMaterial({
      uniforms: {
        tDiffusePrev: {
          value: null
        },
        tDiffuse: {
          value: null
        },
        frameCount: {
          value: 0
        },
        resolution: {
          value: new Vector2(width, height)
        }
      },
      vertexShader,
      fragmentShader
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    this.scene.add(this.mesh);

    this.gui.add(this, 'passes').listen();
    this.gui.add(this, 'maxPasses', 0, 20000);
    this.gui
      .add(this, 'active')
      .onChange(this.reset)
      .listen();
  }

  resize(width: number, height: number) {
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;
    this.reset();
  }

  reset = () => {
    this.passes = 0;
  };

  render(
    scene: BaseScene,
    renderTargetCurrent: WebGLRenderTarget,
    renderTargetPrev: WebGLRenderTarget,
    renderTargetCombined: WebGLRenderTarget
  ) {
    this.mesh.material.uniforms.frameCount.value = this.passes;

    // Render current scene
    renderer.setRenderTarget(renderTargetCurrent);
    renderer.render(scene.scene, scene.camera);

    // Render previous and current frame together
    renderer.setRenderTarget(renderTargetCombined);
    this.mesh.material.uniforms.tDiffuse.value = renderTargetCurrent.texture;
    this.mesh.material.uniforms.tDiffusePrev.value = renderTargetPrev.texture;
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
    this.passes++;
  }

  pauseRendering() {
    return this.active && this.passes >= this.maxPasses;
  }
}
