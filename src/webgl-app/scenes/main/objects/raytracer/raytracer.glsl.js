import { Vector2, Vector3, Vector4 } from 'three';
import camera from './camera.glsl';
import sphere from './sphere.glsl';
import hitables from './hitables.glsl';
import material from './material.glsl';
import world from './world.glsl';

export const uniforms = {
  resolution: { value: new Vector2() },
  fov: { value: 20 },
  seed: { value: new Vector4(Math.random(), Math.random(), Math.random(), Math.random()) },
  time: { value: 0 },
  envMap: { value: null },
  cameraAperture: { value: 0.1 },
  cameraFocusDistance: { value: 10 },
  cameraAutoFocus: { value: 0 },
  cameraPosition: { value: new Vector3() },
  cameraTarget: { value: new Vector3() },
  envMapEnabled: { value: 1 }
};

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = (worldSize: number, maxBounces: number = 50, scene: string = '') => {
  return `
    uniform vec2 resolution;
    uniform float time;
    uniform vec4 seed;
    uniform float fov;
    uniform vec3 cameraTarget;
    uniform float cameraAperture;
    uniform float cameraFocusDistance;
    uniform float cameraAutoFocus;
    uniform sampler2D envMap;
    uniform bool envMapEnabled;
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

    ${camera}
    ${sphere}
    ${material}
    ${hitables(worldSize)}
    ${world(worldSize, maxBounces)}

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

      ${scene}

      float focusDistance = mix(cameraFocusDistance, length(cameraPosition - cameraTarget), cameraAutoFocus);

      Camera camera = createCamera(cameraPosition,
                                  cameraTarget,
                                  vec3(0.0, 1.0, 0.0),
                                  2.0,
                                  cameraAperture,
                                  focusDistance);

      Ray ray = getRay(uv.x, uv.y, camera);

      vec3 outgoingColor = raytraceWorld(ray, world);

      gl_FragColor = vec4(outgoingColor, 1.0);
      gl_FragColor = LinearTosRGB(gl_FragColor);
    }
  `;
};
