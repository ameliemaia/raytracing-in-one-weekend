export default `

  vec3 ref(vec3 v, vec3 n) {
    return v - 2.0 * dot(v, n) * n;
  }

  bool scatter(inout Ray ray, HitRecord hitRecord, out vec3 attenuation, out Ray scatteredRay) {
    if(hitRecord.material.type == METAL) {
      attenuation = hitRecord.material.albedo;
      vec3 reflected = reflect(ray.direction, hitRecord.normal);
      scatteredRay = Ray(hitRecord.position, reflected);
      return (dot(scatteredRay.direction, hitRecord.normal) > 0.0);
    } else {
      attenuation = hitRecord.material.albedo;
      vec3 target = hitRecord.position + hitRecord.normal + randomInSphere();
      scatteredRay = Ray(hitRecord.position, normalize(target - hitRecord.position));
      return true;
    }
  }
`;
