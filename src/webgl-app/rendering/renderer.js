import { sRGBEncoding, WebGLRenderer } from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';
import graphics, { getGraphicsMode, getTier } from './graphics';
import settings from '../settings';
import { setRendererSize } from './resize';
import PostProcessing from './post-processing/post-processing';
import { gui } from '../utils/gui';
import createCanvas from '../utils/canvas';

const { pixelRatio, antialias } = graphics[getGraphicsMode()];

const options = {
  antialias,
  powerPreference: 'high-performance',
  stencil: false,
  preserveDrawingBuffer: true
};

if (WEBGL.isWebGL2Available()) {
  const { canvas } = createCanvas(1, 1);
  options.context = canvas.getContext('webgl2');
}

const renderer = new WebGLRenderer(options);
renderer.setClearColor(0x000000);
renderer.outputEncoding = sRGBEncoding;

// Enable shader errors during dev
renderer.debug.checkShaderErrors = settings.isDevelopment;

const guiRendering = gui.addFolder('rendering');
guiRendering.open();

renderer.setPixelRatio(pixelRatio);
renderer.setScissorTest(true);
setRendererSize(renderer, window.innerWidth, window.innerHeight);

export const postProcessing = new PostProcessing(guiRendering);

const gl = renderer.getContext();
const gpuInfo = gl.getExtension('WEBGL_debug_renderer_info');
const gpu = gl.getParameter(gpuInfo.UNMASKED_RENDERER_WEBGL);

if (settings.isDevelopment) console.log(`Graphics: ${getGraphicsMode()}\nGPU: ${gpu}\nTier: ${getTier()}`);

export default renderer;
