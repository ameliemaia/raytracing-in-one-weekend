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
import renderer from '../../../renderer';
import { getRenderBufferSize } from '../../../resize';

export default class CopyPass {
  scene: Scene;

  camera: PerspectiveCamera;

  mesh: Mesh;

  constructor(gui: GUI, geometry: BufferGeometry, camera: OrthographicCamera) {
    this.scene = new Scene();
    this.camera = camera;
    const { width, height } = getRenderBufferSize();
    const material = new ShaderMaterial({
      uniforms: {
        tDiffuse: {
          // Keep it the same as threejs for reusability
          value: null
        },
        resolution: {
          value: new Vector2(width, height)
        }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution;
          gl_FragColor = texture2D(tDiffuse, uv);
        }
      `
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

  render(renderTarget: WebGLRenderTarget, renderTargetCopy: WebGLRenderTarget, toScreen: boolean = false) {
    if (toScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(renderTarget);
      this.mesh.material.uniforms.tDiffuse.value = renderTargetCopy.texture;
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(null);
    }
  }
}
