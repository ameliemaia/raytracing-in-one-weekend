export default `


  bool scatter(inout Ray ray, HitRecord hitRecord, out vec3 attenuation, out Ray scatteredRay) {
    if(hitRecord.material.type == METAL) {
      attenuation = hitRecord.material.albedo;
      vec3 reflected = reflect(normalize(ray.direction), hitRecord.normal);
      scatteredRay = Ray(hitRecord.position, reflected);
      attenuation = hitRecord.material.albedo;
      return (dot(scatteredRay.direction, hitRecord.normal) > 0.0);
    } else {
      scatteredRay = Ray(hitRecord.position, normalize(hitRecord.normal + randomInSphere()));
      attenuation = hitRecord.material.albedo;
      return true;
    }
  }
`;
