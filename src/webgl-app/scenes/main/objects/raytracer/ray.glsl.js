export default `
  struct Ray {
    vec3 origin;
    vec3 direction;
  };

  Ray getRay(float u, float v, Camera camera) {
    return Ray(camera.origin, camera.lowerLeftCorner + u * camera.horizontal + v * camera.vertical - camera.origin);
  }

  vec3 pointAtParameter(float t, Ray ray) {
    return ray.origin + t * ray.direction;
  }
`;
