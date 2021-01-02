export default `

  bool scatter(inout Ray ray, HitRecord hitRecord, out vec3 attenuation) {
    attenuation = hitRecord.material.albedo;
    if(hitRecord.material.type == METAL) {
      vec3 reflected = reflect(ray.direction, hitRecord.normal);
      ray = Ray(hitRecord.position, reflected);
      return (dot(ray.direction, hitRecord.normal) > 0.0);
    } else {
      ray = Ray(hitRecord.position, normalize(hitRecord.normal + randomInSphere()));
      return true;
    }
  }
`;
