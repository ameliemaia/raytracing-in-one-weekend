export default (worldSize: number) => {
  return `
    bool sphereHit(Ray ray, const in float tMin, const in float tMax, const in Sphere sphere, inout HitRecord hitRecord) {

      vec3 oc = ray.origin - sphere.center;
      float a = dot(ray.direction, ray.direction); // origin
      float b = dot(oc, ray.direction);
      float c = dot(oc, oc) - sphere.radius * sphere.radius;
      float discriminant = b * b - a * c;

      if (discriminant < 0.0) return false;

      float s = sqrt(discriminant);

      float temp = (-b - s) / a;
      if (temp < tMax && temp > tMin) {
        hitRecord.t = temp;
        hitRecord.position = ray.origin + temp * ray.direction;
        hitRecord.normal = (hitRecord.position - sphere.center) / sphere.radius;
        hitRecord.material = sphere.material;
        return true;
      }
      temp = (-b + s) / a;
      if (temp < tMax && temp > tMin) {
        hitRecord.t = temp;
        hitRecord.position = ray.origin + temp * ray.direction;
        hitRecord.normal = (hitRecord.position - sphere.center) / sphere.radius;
        hitRecord.material = sphere.material;
        return true;
      }
      return false;
    }

    bool hit(Ray ray, float tMin, float tMax, Sphere list[${worldSize}], inout HitRecord hitRecord) {
      bool hitAnything = false;
      float closestSoFar = tMax;
      // If record doesn't hit, we use the previous
      HitRecord tempRecord = hitRecord;
      for(int i = 0; i < ${worldSize}; i++) {
        if (sphereHit(ray, tMin, closestSoFar, list[i], tempRecord)) {
          hitAnything = true;
          closestSoFar = tempRecord.t;
          hitRecord = tempRecord;
        }
      }
      return hitAnything;
    }
  `;
};
