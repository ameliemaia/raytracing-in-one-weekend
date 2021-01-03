export const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tDiffusePrev;
  uniform vec2 resolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 texel0 = texture2D(tDiffusePrev, uv);
    vec4 texel1 = texture2D(tDiffuse, uv);
    gl_FragColor = mix(texel0, texel1, 0.05);
  }
`;
