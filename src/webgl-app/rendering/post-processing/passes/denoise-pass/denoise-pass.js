import { Mesh, Scene, ShaderMaterial, Vector2, WebGLRenderTarget } from 'three';
import renderer from '../../../renderer';
import { getRenderBufferSize } from '../../../resize';
import { vertexShader, fragmentShader } from './shader.glsl';

const THRESHOLD = 0.05;

export default class DenoisePass {
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
        threshold: {
          value: THRESHOLD
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

    this.active = false;
    this.passes = 0;

    this.gui.add(this, 'passes').listen();
    this.gui.add(this, 'active').onChange(this.reset);
    this.gui.add(this.mesh.material.uniforms.threshold, 'value', 0, 1).name('threshold');
  }

  resize(width: number, height: number) {
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;
  }

  reset = () => {
    this.passes = 0;
    this.mesh.material.uniforms.threshold.value = 1;
    requestAnimationFrame(() => {
      this.mesh.material.uniforms.threshold.value = THRESHOLD;
    });
  };

  render(
    scene: BaseScene,
    renderTargetCurrent: WebGLRenderTarget,
    renderTargetPrev: WebGLRenderTarget,
    renderTargetCombined: WebGLRenderTarget
  ) {
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
}
