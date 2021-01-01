import { Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three';
import { uniforms, vertexShader, fragmentShader } from './shader.glsl';

export default class Raytracer {
  constructor(gui: GUI) {
    this.gui = gui.addFolder('raytracer');
    this.gui.open();
    this.material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });
    this.mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.material);
    this.gui.add(this.mesh.material.uniforms.screenSize, 'value', 1, 5).name('screenSize');
  }

  resize(width: number, height: number) {
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;
  }
}