export default `
  struct Sphere {
    vec3 center;
    float radius;
    Material material;
  };

  float sphere(Sphere sphere, Ray ray) {
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.direction, ray.direction); // origin
    float b = 2.0 * dot(oc, ray.direction); // direction
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4.0 * a * c;
    if(discriminant < 0.0){
      return -1.0;
    } else {
      return (-b - sqrt(discriminant)) / (2.0 * a);
    }
  }
`;
