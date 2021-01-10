import { GUI } from 'dat.gui';
import { MathUtils, Mesh, PerspectiveCamera, PlaneBufferGeometry, Scene, ShaderMaterial, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getGraphicsMode, GRAPHICS_HIGH } from '../../../../rendering/graphics';
import { postProcessing } from '../../../../rendering/renderer';
import { uniforms, vertexShader, fragmentShader } from './raytracer.glsl';

const SCENE_FINAL = 'final';
const SCENE_SIMPLE = 'simple';

export default class Raytracer {
  gui: GUI;

  camera: PerspectiveCamera;

  control: OrbitControls;

  scene: Scene;

  mesh: Mesh;

  maxSpheres: number;

  maxBounces: number;

  gridSize: number;

  cameraAutoFocus: boolean;

  constructor(gui: GUI, camera: PerspectiveCamera, control: OrbitControls) {
    this.gui = gui.addFolder('raytracer');
    this.gui.open();

    this.camera = camera;
    this.control = control;

    this.maxSpheres = getGraphicsMode() === GRAPHICS_HIGH ? 100 : 50;
    this.maxBounces = getGraphicsMode() === GRAPHICS_HIGH ? 50 : 25;
    this.gridSize = getGraphicsMode() === GRAPHICS_HIGH ? 11 : 7;

    const scenes = [SCENE_FINAL, SCENE_SIMPLE];

    this.scene = scenes[0];
    this.cameraAutoFocus = uniforms.cameraAutoFocus.value === 1;

    this.mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.createMaterial());

    this.gui.add(this, 'scene', scenes).onChange(this.rebuild);
    this.gui.add(this, 'maxBounces', 1, 100, 1).onChange(this.rebuild);
    this.gui.add(this, 'maxSpheres', 1, 500, 1).onChange(this.rebuild);
    this.gui.add(this, 'gridSize', 1, 11).onChange(this.rebuild);

    const guiCamera = this.gui.addFolder('camera');
    guiCamera.open();

    guiCamera
      .add(this.mesh.material.uniforms.fov, 'value', 1, 100)
      .name('fov')
      .onChange(this.onChange);
    guiCamera
      .add(this.mesh.material.uniforms.cameraAperture, 'value', 0, 10)
      .name('aperture')
      .onChange(this.onChange)
      .listen();
    guiCamera
      .add(this.mesh.material.uniforms.cameraFocusDistance, 'value', 0, 100)
      .name('focus dist')
      .onChange(this.onChange)
      .listen();
    guiCamera
      .add(this, 'cameraAutoFocus', 0, 1)
      .name('auto focus')
      .onChange(() => {
        this.mesh.material.uniforms.cameraAutoFocus.value = this.cameraAutoFocus ? 1 : 0;
        this.onChange();
      })
      .listen();
  }

  createSimpleScene() {
    const scene = `
    Sphere world[5];
    world[0] = Sphere(vec3(0.0, 0.0, -1.0), 0.5, Material(LAMBERT, vec3(0.1, 0.2, 0.5), 0.0));
    world[1] = Sphere(vec3(0.0, -100.5, 0.0), 100.0, Material(LAMBERT, vec3(0.5), 0.0));
    world[2] = Sphere(vec3(1.0, 0.0, -1.0), 0.5, Material(METAL, vec3(0.8, 0.6, 0.2), 0.0));
    world[3] = Sphere(vec3(-1.0, 0.0, -1.0), 0.5, Material(DIELECTRIC, vec3(0), 1.5));
    world[4] = Sphere(vec3(-1.0, 0.0, -1.0), -0.45, Material(DIELECTRIC, vec3(0), 1.5));
  `;
    return { scene, size: 5 };
  }

  createFinalScene() {
    const size = this.maxSpheres + 4;

    let scene = '';
    const world = [];
    world[0] = `Sphere(vec3(0.0, -1000.0, 0.0), 1000.0, Material(LAMBERT, vec3(0.5), 0.0))`;
    world[1] = `Sphere(vec3(0.0, 1.0, 0.0), 1.0, Material(DIELECTRIC, vec3(0), 1.5))`;
    world[2] = `Sphere(vec3(-4.0, 1.0, 0.0), 1.0, Material(LAMBERT, vec3(0.4, 0.2, 0.1), 0.0))`;
    world[3] = `Sphere(vec3(4.0, 1.0, 0.0), 1.0, Material(METAL, vec3(0.7, 0.6, 0.5), 0.0))`;

    const offset = new Vector3(4, 0.2, 0);
    const total = size - world.length;
    const grid = Math.floor(Math.sqrt(total));
    let n = world.length;

    for (let i = 0; i < total; i++) {
      const chooseMat = Math.random();
      const center = new Vector3(0, 0.2, 0);

      const row = Math.floor(i / grid) / grid;
      const col = (i % grid) / grid;

      center.x = MathUtils.lerp(-this.gridSize, this.gridSize, row) + MathUtils.randFloat(0, 0.9);
      center.z = MathUtils.lerp(-this.gridSize, this.gridSize, col) + MathUtils.randFloat(0, 0.9);

      if (center.distanceTo(offset) > 0.9) {
        if (chooseMat < 0.8) {
          world[n++] = `Sphere(vec3(${center.x},${center.y},${center.z}), 0.2, Material(LAMBERT, vec3(${Math.random() *
            Math.random()}, ${Math.random() * Math.random()}, ${Math.random() * Math.random()}), 0.0))`;
        } else if (chooseMat < 0.95) {
          world[n++] = `Sphere(vec3(${center.x},${center.y},${center.z}), 0.2, Material(METAL, vec3(${0.5 *
            (Math.random() + 1)},${0.5 * (Math.random() + 1)}, ${0.5 * (Math.random() + 1)}), ${Math.random() * 0.5}))`;
        } else {
          world[n++] = `Sphere(vec3(${center.x},${center.y},${center.z}), 0.2, Material(DIELECTRIC, vec3(0), 1.5));`;
        }
      }
    }

    for (let i = 0; i < world.length; i++) {
      scene += `world[${i}] = ${world[i]};\n`;
    }

    // Prefix
    scene = `Sphere world[${world.length}];\n` + scene;

    return { scene, size: world.length };
  }

  createMaterial = () => {
    const data = this.getSceneShader();
    return new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader: fragmentShader(data.size, this.maxBounces, data.scene)
    });
  };

  getSceneShader() {
    switch (this.scene) {
      case SCENE_FINAL:
        return this.createFinalScene();
      default:
        return this.createSimpleScene();
    }
  }

  rebuild = () => {
    this.mesh.material = this.createMaterial();
    switch (this.scene) {
      case SCENE_FINAL:
        this.camera.position.set(13, 2, 3);
        this.control.target.set(0, 0, 0);
        this.setAperture(0.1);
        this.setFocusDistance(10);
        this.setAutoFocus(false);
        break;
      default:
        this.camera.position.set(3, 3, 2);
        this.control.target.set(0, 0, -1);
        this.setAperture(2);
        this.setAutoFocus(true);
        break;
    }

    this.onChange();
  };

  setAperture(value: number) {
    this.mesh.material.uniforms.cameraAperture.value = value;
  }

  setAutoFocus(value: boolean) {
    this.mesh.material.uniforms.cameraAutoFocus.value = value ? 1 : 0;
    this.cameraAutoFocus = value;
  }

  setFocusDistance(value: number) {
    this.mesh.material.uniforms.cameraFocusDistance.value = value;
  }

  onChange = () => {
    postProcessing.denoisePass.reset();
  };

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
