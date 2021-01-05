import { WORLD_SIZE, MAX_BOUNCES } from './constants';

export default `
  vec3 raytraceWorld(in Ray ray, Sphere world[${WORLD_SIZE}]) {
    HitRecord hitRecord;
    vec3 color = vec3(1);

    for(int i = 0; i < ${MAX_BOUNCES}; i++) {
      Ray scatteredRay;
      if (hit(ray, 0.001, MAX_FLOAT, world, hitRecord)) {
          vec3 attenuation;
          if(scatter(ray, hitRecord, attenuation, scatteredRay)) {
            color *= attenuation;
            ray = scatteredRay;
          } else {
            // Sky color
            // float t = 0.5 * ray.direction.y + 1.0;
            // color *= mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
            return vec3(0);
          }
      } else {
        // Sky color
        float t = 0.5 * ray.direction.y + 1.0;
        color *= mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
        return color;
      }
    }

    return vec3(0);
  }
`;
