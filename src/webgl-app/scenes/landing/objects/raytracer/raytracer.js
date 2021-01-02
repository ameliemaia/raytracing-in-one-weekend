import { CanvasTexture, Mesh, NearestFilter, PlaneBufferGeometry, ShaderMaterial, sRGBEncoding } from 'three';
import { getRenderBufferSize } from '../../../../rendering/resize';
import createCanvas from '../../../../utils/canvas';
import { uniforms, vertexShader, fragmentShader } from './shader.glsl';

export default class Raytracer {
  constructor(gui: GUI) {
    this.gui = gui.addFolder('raytracer');
    this.gui.open();

    const { canvas, ctx } = createCanvas(128, 128);
    this.canvas = canvas;
    this.ctx = ctx;

    uniforms.randomMap.value = new CanvasTexture(this.canvas);
    uniforms.randomMap.value.encoding = sRGBEncoding;
    uniforms.randomMap.value.minFilter = NearestFilter;
    uniforms.randomMap.value.magFilter = NearestFilter;

    this.material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });
    this.mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.material);
    this.gui.add(this.mesh.material.uniforms.screenSize, 'value', 1, 5).name('screenSize');

    Object.assign(this.canvas.style, {
      position: 'absolute',
      zIndex: '1',
      top: '0',
      left: '0'
    });

    // document.body.appendChild(this.canvas);
  }

  resize(width: number, height: number) {
    this.mesh.material.uniforms.resolution.value.x = width;
    this.mesh.material.uniforms.resolution.value.y = height;

    const size = getRenderBufferSize();
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    this.generateNoise();
  }

  generateNoise() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const length = imageData.data.length;
    for (let i = 0; i < length; i += 4) {
      imageData.data[i] = parseInt(Math.random() * 255);
      imageData.data[i + 1] = parseInt(Math.random() * 255);
      imageData.data[i + 2] = parseInt(Math.random() * 255);
      imageData.data[i + 3] = 255;
    }
    this.ctx.putImageData(imageData, 0, 0);

    this.mesh.material.uniforms.randomMap.value.needsUpdate = true;
  }

  update(delta: number) {
    this.mesh.material.uniforms.time.value += delta;
  }
}
