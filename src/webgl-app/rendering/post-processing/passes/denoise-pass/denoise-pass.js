import { Mesh, Scene, ShaderMaterial, Vector2, WebGLRenderTarget } from 'three';
import renderer from '../../../renderer';
import { getRenderBufferSize } from '../../../resize';
import { vertexShader, fragmentShader } from './shader.glsl';

export default class DenoisePass {
  constructor(gui: GUI, geometry: BufferGeometry, camera: OrthographicCamera) {
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
  }

  resize(width: number, height: number) {
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;
  }

  render(renderTargetCurrent: WebGLRenderTarget, renderTargetPrev: WebGLRenderTarget, renderTarget: WebGLRenderTarget) {
    renderer.setRenderTarget(renderTarget);
    this.mesh.material.uniforms.tDiffuse.value = renderTargetCurrent.texture;
    this.mesh.material.uniforms.tDiffusePrev.value = renderTargetPrev.texture;
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
}
