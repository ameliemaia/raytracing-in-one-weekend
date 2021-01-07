export default `

  vec3 ref(vec3 direction, vec3 normal) {
    return direction - 2.0 * dot(direction, normal) * normal;
  }

  bool refract(const in vec3 direction, const in vec3 normal, const in float niOverNt, out vec3 refracted) {
    float dt = dot(direction, normal);
    float discriminant = 1.0 - niOverNt * niOverNt * (1.0 - dt * dt);
    if (discriminant > 0.0) {
      refracted = niOverNt * (direction - normal * dt) - normal * sqrt(discriminant);
      return true;
    }
    return false;
  }

  float schlick(float cosine, float reflectionIndex) {
    float r0 = (1.0 - reflectionIndex) / (1.0 + reflectionIndex);
    r0 = r0 * r0;
    return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
  }

  bool scatter(inout Ray ray, const in HitRecord hitRecord, out vec3 attenuation, out Ray scatteredRay) {
    if(hitRecord.material.type == METAL) {
      attenuation = hitRecord.material.albedo;
      vec3 reflected = reflect(ray.direction, hitRecord.normal);
      float fuzz = clamp(hitRecord.material.value, 0.0, 1.0);
      scatteredRay = Ray(hitRecord.position, normalize(reflected + fuzz * randomInSphere(hitRecord.normal.xz)));
      return (dot(scatteredRay.direction, hitRecord.normal) > 0.0);
    } else if(hitRecord.material.type == DIELECTRIC) {

      vec3 outwardNormal = vec3(0);
      vec3 reflected = reflect(ray.direction, hitRecord.normal);
      float niOverNt = 0.0;

      float reflectionIndex = hitRecord.material.value;

      attenuation = vec3(1.0);
      vec3 refracted = vec3(0);
      float reflectProbability = 0.0;
      float cosine = 0.0;

      if (dot(ray.direction, hitRecord.normal) > 0.0) {
        outwardNormal = -hitRecord.normal;
        niOverNt = reflectionIndex;
        cosine = reflectionIndex * dot(ray.direction, hitRecord.normal) / length(ray.direction);
      } else {
        outwardNormal = hitRecord.normal;
        niOverNt = 1.0 / reflectionIndex;
        cosine = -dot(ray.direction, hitRecord.normal) / length(ray.direction);
      }

      if(refract(ray.direction, outwardNormal, niOverNt, refracted)) {
        scatteredRay = Ray(hitRecord.position, refracted);
        reflectProbability = schlick(cosine, hitRecord.material.value);
      } else {
        scatteredRay = Ray(hitRecord.position, reflected);
        reflectProbability = 1.0;
      }

      if (rand(vUv + seed.xy + hitRecord.position.xz) < reflectProbability) {
        scatteredRay = Ray(hitRecord.position, reflected);
      } else {
        scatteredRay = Ray(hitRecord.position, refracted);
      }

      return true;
    } else {
      // lambert
      attenuation = hitRecord.material.albedo;
      vec3 target = hitRecord.position + hitRecord.normal + randomInSphere(hitRecord.normal.xz);
      scatteredRay = Ray(hitRecord.position, normalize(target - hitRecord.position));
      return true;
    }
  }
`;
