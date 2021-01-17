export default (worldSize: number, maxBounces: number) => {
  return `

    /**
    * https://github.com/vorg/pragmatic-pbr/blob/master/local_modules/glsl-envmap-equirect/index.glsl
    * Samples equirectangular (lat/long) panorama environment map
    */
    vec2 envMapEquirect(vec3 worldCenterNormal, float flipEnvMap) {
      // I assume envMap texture has been flipped the WebGL way (pixel 0,0 is a the bottom)
      // therefore we flip worldCenterNormal.y as acos(1) = 0
      float phi = acos(worldCenterNormal.y);
      float theta = atan(flipEnvMap * worldCenterNormal.x, worldCenterNormal.z) + PI;
      return vec2(theta / TWO_PI, phi / PI);
    }

    vec2 envMapEquirect(vec3 worldCenterNormal) {
      // -1.0 for left handed coordinate system oriented texture (usual case)
      return envMapEquirect(worldCenterNormal, -1.0);
    }

    vec3 raytraceWorld(in Ray ray, Sphere world[${worldSize}]) {
    HitRecord hitRecord;
    vec3 color = vec3(1);

    for(int i = 0; i < ${maxBounces}; i++) {
      Ray scatteredRay;
      if (hit(ray, 0.001, MAX_FLOAT, world, hitRecord)) {
          vec3 attenuation;
          if(scatter(ray, hitRecord, attenuation, scatteredRay)) {
            color *= attenuation;
            ray = scatteredRay;
          } else {
            return vec3(0);
          }
      } else {
        if (envMapEnabled) {
          // Env map color
          vec3 worldNormal = normalize(vec3(0) - ray.direction);
          vec2 envUV = envMapEquirect(worldNormal);
          color *= texture2D(envMap, envUV).rgb;
        } else {
          // Sky color
          float t = 0.5 * ray.direction.y + 1.0;
          color *= mix(vec3(1), vec3(0.5, 0.7, 1.0), t);
        }
        return color;
      }
    }
    return vec3(0);
  }
  `;
};
