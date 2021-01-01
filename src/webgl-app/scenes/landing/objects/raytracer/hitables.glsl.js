import { WORLD_SIZE } from './constants';

export default `
 struct HitRecord {
    float t;
    vec3 position;
    vec3 normal;
  };

  bool sphereHit(Ray ray, float tMin, float tMax, Sphere sphere, inout HitRecord hitRecord) {
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.direction, ray.direction); // origin
    float b = dot(oc, ray.direction); // direction
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - a * c;
    if(discriminant > 0.0) {
      float temp = (-b - sqrt(discriminant)) / a;
      if (temp < tMax && temp > tMin) {
        hitRecord.t = temp;
        hitRecord.position = pointAtParameter(hitRecord.t, ray);
        hitRecord.normal = (hitRecord.position - sphere.center) / sphere.radius;
        return true;
      }
      temp = (-b + sqrt(discriminant)) / a;
      if (temp < tMax && temp > tMin) {
        hitRecord.t = temp;
        hitRecord.position = pointAtParameter(hitRecord.t, ray);
        hitRecord.normal = (hitRecord.position - sphere.center) / sphere.radius;
        return true;
      }
      return false;
    }
  }

  bool hit(Ray ray, float tMin, float tMax, Sphere list[${WORLD_SIZE}], inout HitRecord hitRecord) {
    HitRecord tempRecord;
    bool hitAnything = false;
    float closestSoFar = tMax;
    for(int i = 0; i < ${WORLD_SIZE}; i++) {
      if (sphereHit(ray, tMin, closestSoFar, list[i], tempRecord)) {
        hitAnything = true;
        closestSoFar = tempRecord.t;
        hitRecord = tempRecord;
      }
    }
    return hitAnything;
  }


`;
