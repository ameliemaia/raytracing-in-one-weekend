import { Vector2 } from 'three';
import ray from './ray.glsl';
import camera from './camera.glsl';
import sphere from './sphere.glsl';
import hitables from './hitables.glsl';
import { WORLD_SIZE, MAX_RECURSION } from './constants';
import { ShaderChunk } from 'three';

console.log(ShaderChunk.encodings_fragment);

export const uniforms = {
  resolution: { value: new Vector2() },
  screenSize: { value: 2 },
  time: { value: 2 }
};

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const calculateNormals = `
  vec3 calculateNormals(float t, vec3 center, Ray ray) {
    vec3 normal = pointAtParameter(t, ray) - center;
    normal /= length(normal); // make normal unit length
    return normal;
  }
`;

export const raytrace = `

  #define MAX_FLOAT 1e5

  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  vec3 randomInSphere(vec3 position) {
    float x = random(position.xy);
    float y = random(vUv);
    float z = random(position.xz);
    float r = sqrt(x*x + y*y + z*z);
    x /= r;
    y /= r;
    z /= r;
    return normalize(vec3(x, y, z));
  }

  vec3 raytrace(in Ray ray, Sphere world[${WORLD_SIZE}]) {
    HitRecord hitRecord;
    vec3 color = vec3(1);

    for(int i = 0; i < ${MAX_RECURSION}; i++) {
      if (hit(ray, 0.001, MAX_FLOAT, world, hitRecord)) {
        vec3 target = hitRecord.position + hitRecord.normal + randomInSphere(hitRecord.position);
        ray.origin = hitRecord.position;
        ray.direction = normalize(target - hitRecord.position);
        color *= 0.5;
      } else {
        float t = 0.5 * ray.direction.y + 0.5;
        color *= mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
        return color;
      }
    }

    return color;
  }
`;

export const fragmentShader = `
  uniform vec2 resolution;
  uniform float screenSize;
  varying vec2 vUv;

  ${ray}
  ${camera}
  ${sphere}
  ${hitables}
  ${calculateNormals}
  ${raytrace}

  void main(){

    // Fix aspect
    vec2 uv = vUv;
    uv.y -= 0.5;
    uv.y *= 2.0 * resolution.y / resolution.x;
    uv.y += 0.5;

    Sphere world[${WORLD_SIZE}];
    world[0] = Sphere(vec3(0.0, 0.0, -1.0), 0.5);
    world[1] = Sphere(vec3(0.0, -100.5, -1.0), 100.0);

    vec3 lowerLeftCorner = vec3(-screenSize, -screenSize*0.5, -1.0);
    vec3 horizontal = vec3(screenSize * 2.0, 0.0, 0.0); // screen space coords for scanning the scene
    vec3 vertical = vec3(0.0, screenSize, 0.0); // -2, -2, 2, 2

    Ray ray = Ray(vec3(0), lowerLeftCorner + uv.x * horizontal + uv.y * vertical);

    Camera camera = Camera(
      lowerLeftCorner,
      horizontal,
      vertical,
      ray
    );

    vec3 outgoingColor = raytrace(ray, world);

    gl_FragColor = vec4(outgoingColor, 1.0);

    ${ShaderChunk.encodings_fragment}
  }
`;
