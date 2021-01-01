import { Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three';
import { uniforms, vertexShader, fragmentShader } from './shader.glsl';

export default class Raytracer {
  constructor() {
    this.material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });
    this.mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.material);
  }
}
