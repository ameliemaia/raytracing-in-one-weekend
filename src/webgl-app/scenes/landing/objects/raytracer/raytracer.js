import { Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three';
import { getRenderBufferSize } from '../../../../rendering/resize';
import { uniforms, vertexShader, fragmentShader } from './shader.glsl';

export default class Raytracer {
  constructor() {
    this.material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });
    this.mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.material);
    this.resize();
  }

  resize() {
    let { width, height } = getRenderBufferSize();
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;
  }
}
