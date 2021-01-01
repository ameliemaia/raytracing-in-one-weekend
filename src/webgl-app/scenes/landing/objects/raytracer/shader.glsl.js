export const uniforms = {};

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  void main(){
    gl_FragColor = vec4(vUv, 1.0, 1.0);
  }
`;
