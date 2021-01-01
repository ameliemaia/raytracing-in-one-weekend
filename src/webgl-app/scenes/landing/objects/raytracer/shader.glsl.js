import { Vector2 } from 'three';

export const uniforms = {
  resolution: { value: new Vector2() }
};

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const utils = `
  vec3 pointAtParameter(float t, vec3 origin, vec3 direction) {
    return origin + t * direction;
  }
`;

export const calculateNormals = `
  vec3 calculateNormals(float t, vec3 center, vec3 origin, vec3 direction) {
    vec3 normal = pointAtParameter(t, origin, direction) - center;
    normal /= length(normal);
    return normal;
  }
`;

export const sphere = `
  float sphere(vec3 center, float radius, vec3 origin, vec3 direction) {
    vec3 oc = origin - center;
    float a = dot(direction, direction); // origin
    float b = 2.0 * dot(oc, direction); // direction
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

  vec3 raytrace(vec3 origin, vec3 direction) {
    vec3 spherePosition = vec3(0.0, 0.0, -1.0);

    float t = sphere(spherePosition, 0.5, origin, direction);

    if (t > 0.0) {
      vec3 normal = calculateNormals(t, spherePosition, origin, direction);
      return (normal * 0.5) + 0.5;
    }

    t = 0.5 * direction.y + 1.0;
    // return (1.0 - t) * vec3(1) + t * vec3(0.5, 0.7, 1.0);
    return mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
  }
`;

export const fragmentShader = `
  uniform vec2 resolution;
  varying vec2 vUv;

  ${raytrace}

  void main(){

    vec2 uv = vUv;
    uv.y -= 0.5;
    uv.y *= 2.0 * resolution.y / resolution.x;
    uv.y += 0.5;

    vec3 lowerLeftCorner = vec3(-2.0, -1.0, -1.0);
    vec3 horizontal = vec3(4.0, 0.0, 0.0);
    vec3 vertical = vec3(0.0, 2.0, 0.0);
    vec3 rayOrigin = vec3(0);
    vec3 color = raytrace(rayOrigin, lowerLeftCorner + uv.x * horizontal + uv.y * vertical);
    vec3 outgoingColor = color;//vec3(1);

    gl_FragColor = vec4(outgoingColor, 1.0);
  }
`;
