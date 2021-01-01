export default `
 struct HitRecord {
    float t;
    vec3 position;
    vec3 normal;
  };

  struct Hitable {
    Ray ray;
    float tMin;
    float tMax;
  };

  // bool hit(Ray ray, float tMin, float tMax, Sphere list[2], HitRecord hitRecord) {
  //   bool hitAnything = false;
  //   float closestSoFar = tMax;
  //   for(int = 0; i < 2; i++) {
  //     // if ()
  //   }
  //   return hitAnything;
  // }

  // bool sphereHit(Ray ray, float tMin, float tMax, Sphere sphere, HitRecord hitRecord) {
  //   vec3 oc = ray.origin - center;
  //   float a = dot(ray.direction, ray.direction); // origin
  //   float b = 2.0 * dot(oc, ray.direction); // direction
  //   float c = dot(oc, oc) - radius * radius;
  //   float discriminant = b * b - a * c;
  //   if(discriminant > 0.0) {
  //     float temp = (-b - sqrt(discriminant)) / a;
  //     if (temp < tMax && temp > tMin) {
  //       hitRecord.t = temp;
  //       hitRecord.position = pointAtParameter(temp, ray);
  //       hitRecord.normal = (hitRecord.position - sphere.center) / sphere.radius;
  //       return true;
  //     }
  //     temp = (-b + sqrt(discriminant)) / a;
  //     if (temp < tMax && temp > tMin) {
  //       hitRecord.t = temp;
  //       hitRecord.position = pointAtParameter(temp, ray);
  //       hitRecord.normal = (hitRecord.position - sphere.center) / sphere.radius;
  //       return true;
  //     }
  //     return false;
  //   }
  // }
`;
