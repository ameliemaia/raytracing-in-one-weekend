import { Vector2, WebGLRenderer } from 'three';
import graphics, { getGraphicsMode } from './graphics';
import settings from '../settings';

const { maxFrameBufferSize, pixelRatio } = graphics[getGraphicsMode()];

const baseSize = Math.sqrt(maxFrameBufferSize.x * maxFrameBufferSize.y);
const maxSize = baseSize * baseSize;

export const rendererSize = new Vector2();

export function getRenderBufferSize(): { width: number, height: number } {
  return {
    width: rendererSize.x * pixelRatio,
    height: rendererSize.y * pixelRatio
  };
}

function resize(windowWidth: number, windowHeight: number): { width: number, height: number } {
  let width = windowWidth;
  let height = windowHeight;
  if (windowWidth * windowHeight > maxSize) {
    const ratio = height / width;
    width = baseSize;
    height = Math.floor(baseSize * ratio);
    let newSize = width * height;
    const scalar = Math.sqrt(maxSize / newSize);
    width = Math.floor(width * scalar);
    height = Math.floor(height * scalar);
  }
  return {
    width,
    height
  };
}

const screenshot = false;
const isPortrait = false;

export function setRendererSize(renderer: WebGLRenderer, windowWidth: number, windowHeight: number) {
  let { width, height } = resize(windowWidth, windowHeight);
  if (settings.renderBufferFullscreen) {
    width = windowWidth;
    height = windowHeight;

    console.log(width, height);
  }

  if (screenshot) {
    width = maxFrameBufferSize.x;
    height = maxFrameBufferSize.y;
  }

  rendererSize.x = isPortrait ? height : width;
  rendererSize.y = isPortrait ? width : height;
  renderer.setSize(rendererSize.x, rendererSize.y);

  if (!screenshot) {
    renderer.domElement.style.width = `${windowWidth}px`;
    renderer.domElement.style.height = `${windowHeight}px`;
  }
}
