import { Vector2, Vector3, Vector4 } from 'three';
import ray from './ray.glsl';
import camera from './camera.glsl';
import sphere from './sphere.glsl';
import hitables from './hitables.glsl';
import material from './material.glsl';
import world from './world.glsl';
import { WORLD_SIZE } from './constants';

export const uniforms = {
  resolution: { value: new Vector2() },
  screenSize: { value: 2 },
  seed: { value: new Vector4(Math.random(), Math.random(), Math.random(), Math.random()) },
  time: { value: 2 },
  sphere0Position: { value: new Vector3(0.0, 0.0, -1.0) },
  sphere1Position: { value: new Vector3(1.0, 0.0, -1.0) },
  sphere2Position: { value: new Vector3(-1.0, 0.0, -1.0) }
};

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform vec2 resolution;
  uniform float time;
  uniform vec4 seed;
  uniform float screenSize;
  uniform vec3 sphere0Position;
  uniform vec3 sphere1Position;
  uniform vec3 sphere2Position;
  varying vec2 vUv;

  #define MAX_FLOAT 1e5
  #define PI 3.141592653589793
  #define TWO_PI 6.283185307179586
  #define LAMBERT 0
  #define METAL 1
  #define DIELECTRIC 2

  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  vec3 randomInSphere(vec2 seed2){
    vec2 uv = vec2(rand(vUv + seed.xy + seed2), rand(vUv + seed.xz + seed2));
    float theta = 2.0 * PI * uv.x;
    float phi = acos(2.0 * uv.y - 1.0);
    float radius = 1.0;
    float x = (radius * sin(phi) * cos(theta));
    float y = (radius * sin(phi) * sin(theta));
    float z = (radius * cos(phi));
    return vec3(x, y, z);
  }

  struct Material {
    int type;
    vec3 albedo;
    float value;
  };

  struct HitRecord {
    float t;
    vec3 position;
    vec3 normal;
    Material material;
  };

  ${ray}
  ${camera}
  ${sphere}
  ${material}
  ${hitables}
  ${world}

  vec3 calculateNormals(float t, vec3 center, Ray ray) {
    vec3 normal = pointAtParameter(t, ray) - center;
    normal /= length(normal); // make normal unit length
    return normal;
  }

  void main(){

    // Fix aspect
    vec2 uv = vUv;
    uv.y -= 0.5;
    uv.y *= 2.0 * resolution.y / resolution.x;
    uv.y += 0.5;

    Sphere world[${WORLD_SIZE}];
    world[0] = Sphere(vec3(0.0, 0.0, -1.0), 0.5, Material(LAMBERT, vec3(0.1, 0.2, 0.5), 0.0));
    world[1] = Sphere(vec3(0.0, -100.5, -1.0), 100.0, Material(LAMBERT, vec3(0.5), 0.0));
    world[2] = Sphere(vec3(1.0, 0.0, -1.0), 0.5, Material(METAL, vec3(0.8, 0.6, 0.2), 1.0));
    world[3] = Sphere(vec3(-1.0, 0.0, -1.0), 0.5, Material(DIELECTRIC, vec3(0), 1.5));
    world[4] = Sphere(vec3(-1.0, 0.0, -1.0), -0.45, Material(DIELECTRIC, vec3(0), 1.5));

    vec3 lowerLeftCorner = vec3(-screenSize, -screenSize*0.5, -1.0);
    vec3 horizontal = vec3(screenSize * 2.0, 0.0, 0.0); // screen space coords for scanning the scene
    vec3 vertical = vec3(0.0, screenSize, 0.0); // -2, -2, 2, 2

    // Anti aliasing
    // const int ns = 20;
    // vec3 col = vec3(0);
    // float scale = 0.00001;
    // for(int i = 0; i < ns; i++) {
    //   float u = ((random.x * 2.0 - 1.0) * scale) + uv.x;
    //   float v = ((random.y * 2.0 - 1.0) * scale) + uv.y;

    //   Ray ray = getRay(u, v, lowerLeftCorner, horizontal, vertical);
    //   Camera camera = Camera(
    //     lowerLeftCorner,
    //     horizontal,
    //     vertical,
    //     ray
    //   );

    //   col += raytrace(ray, world);
    // }

    // col /= float(ns);
    // vec3 outgoingColor = col;

    Ray ray = getRay(uv.x, uv.y, lowerLeftCorner, horizontal, vertical);

    Camera camera = Camera(
      lowerLeftCorner,
      horizontal,
      vertical,
      ray
    );

    vec3 outgoingColor = raytraceWorld(ray, world);

    gl_FragColor = vec4(outgoingColor, 1.0);
    gl_FragColor = LinearTosRGB(gl_FragColor);
  }
`;
