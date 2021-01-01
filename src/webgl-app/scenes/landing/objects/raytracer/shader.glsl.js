import { Vector2 } from 'three';

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

export const utils = `
  struct Ray {
    vec3 origin;
    vec3 direction;
  };

  struct HitRecord {
    float t;
    vec3 position;
    vec3 normal;
  };

  vec3 pointAtParameter(float t, Ray ray) {
    return ray.origin + t * ray.direction;
  }
`;

export const calculateNormals = `
  vec3 calculateNormals(float t, vec3 center, Ray ray) {
    vec3 normal = pointAtParameter(t, ray) - center;
    normal /= length(normal); // make normal unit length
    return normal;
  }
`;

export const sphere = `
  float sphere(vec3 center, float radius, Ray ray) {
    vec3 oc = ray.origin - center;
    float a = dot(ray.direction, ray.direction); // origin
    float b = 2.0 * dot(oc, ray.direction); // direction
    float c = dot(oc, oc) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
    if(discriminant < 0.0){
      return -1.0;
    } else {
      return (-b - sqrt(discriminant)) / (2.0 * a);
    }
  }
`;

export const raytrace = `
  ${utils}
  ${sphere}
  ${calculateNormals}

  vec3 raytrace(Ray ray) {
    vec3 spherePosition = vec3(0.0, 0.0, -1.0);

    float t = sphere(spherePosition, 0.5, ray);

    if (t > 0.0) {
      vec3 normal = calculateNormals(t, spherePosition, ray);
      return (normal * 0.5) + 0.5;
    }

    t = 0.5 * ray.direction.y + 1.0;
    // return (1.0 - t) * vec3(1) + t * vec3(0.5, 0.7, 1.0);
    return mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
  }
`;

export const fragmentShader = `
  uniform vec2 resolution;
  uniform float screenSize;
  varying vec2 vUv;

  ${raytrace}

  void main(){

    // Fix aspect
    vec2 uv = vUv;
    uv.y -= 0.5;
    uv.y *= 2.0 * resolution.y / resolution.x;
    uv.y += 0.5;

    vec3 lowerLeftCorner = vec3(-screenSize, -screenSize*0.5, -1.0);
    vec3 horizontal = vec3(screenSize * 2.0, 0.0, 0.0); // screen space coords for scanning the scene
    vec3 vertical = vec3(0.0, screenSize, 0.0); // -2, -2, 2, 2
    // vec3 lowerLeftCorner = vec3(-2.0, -1.0, -1.0);
    // vec3 horizontal = vec3(4.0, 0.0, 0.0); // screen space coords for scanning the scene
    // vec3 vertical = vec3(0.0, 2.0, 0.0); // -2, -2, 2, 2
    vec3 rayOrigin = vec3(0);

    Ray ray = Ray(vec3(0), lowerLeftCorner + uv.x * horizontal + uv.y * vertical);

    vec3 color = raytrace(ray);
    vec3 outgoingColor = color;//vec3(1);

    gl_FragColor = vec4(outgoingColor, 1.0);
  }
`;
