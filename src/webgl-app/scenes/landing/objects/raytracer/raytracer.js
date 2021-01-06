import { Mesh, PerspectiveCamera, PlaneBufferGeometry, ShaderMaterial } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { postProcessing } from '../../../../rendering/renderer';
import { uniforms, vertexShader, fragmentShader } from './raytracer.glsl';

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
    this.gui
      .add(this.mesh.material.uniforms.fov, 'value', 1, 100)
      .name('fov')
      .onChange(this.onChange);

    this.addControl(0);
    this.addControl(1);
    this.addControl(2);
  }

  onChange = () => {
    postProcessing.denoisePass.reset();
  };

  addControl(index: number) {
    const guiFolder = this.gui.addFolder(`sphere${index}`);
    guiFolder.open();
    const range = 5;
    guiFolder
      .add(this.mesh.material.uniforms[`sphere${index}Position`].value, 'x', -range, range)
      .onChange(this.onChange);
    guiFolder
      .add(this.mesh.material.uniforms[`sphere${index}Position`].value, 'y', -range, range)
      .onChange(this.onChange);
    guiFolder
      .add(this.mesh.material.uniforms[`sphere${index}Position`].value, 'z', -range, range)
      .onChange(this.onChange);
    guiFolder.add(this.mesh.material.uniforms.refractionIndex, 'value', 0, 5).onChange(this.onChange);
  }

  onChange = () => {
    postProcessing.denoisePass.reset();
  };

  resize(width: number, height: number, camera: PerspectiveCamera) {
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;
    this.mesh.material.uniforms.cameraAspect.value = camera.aspect;
  }

  update(delta: number, camera: PerspectiveCamera, control: OrbitControls) {
    this.mesh.material.uniforms.seed.value.set(Math.random(), Math.random(), Math.random(), Math.random());
    this.mesh.material.uniforms.time.value += delta;
    this.mesh.material.uniforms.cameraPosition.value.copy(camera.position);
    this.mesh.material.uniforms.cameraTarget.value.copy(control.target);
  }
}
