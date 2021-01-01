import { Vector2 } from 'three';
import ray from './ray.glsl';
import sphere from './sphere.glsl';
import hitables from './hitables.glsl';
import { WORLD_SIZE } from './constants';

export const uniforms = {
  resolution: { value: new Vector2() },
  screenSize: { value: 2 }
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
  vec3 raytrace(Ray ray, Sphere world[${WORLD_SIZE}]) {
    HitRecord hitRecord;
    if (hit(ray, 0.0, 200.0, world, hitRecord)) {
      return (hitRecord.normal * 0.5) + 0.5;
    } else {
      float t = 0.5 * ray.direction.y + 1.0;
      return mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
    }
  }
`;

export const fragmentShader = `
  uniform vec2 resolution;
  uniform float screenSize;
  varying vec2 vUv;

  ${ray}
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

    vec3 lowerLeftCorner = vec3(-screenSize, -screenSize*0.5, -1.0);
    vec3 horizontal = vec3(screenSize * 2.0, 0.0, 0.0); // screen space coords for scanning the scene
    vec3 vertical = vec3(0.0, screenSize, 0.0); // -2, -2, 2, 2

    Ray ray = Ray(vec3(0), lowerLeftCorner + uv.x * horizontal + uv.y * vertical);

    vec3 outgoingColor = raytrace(ray, world);
    // vec3 outgoingColor = vec3(1);

    gl_FragColor = vec4(outgoingColor, 1.0);
  }
`;
