export default `
  struct Ray {
    vec3 origin;
    vec3 direction;
  };

  Ray getRay(float u, float v, vec3 lowerLeftCorner, vec3 horizontal, vec3 vertical) {
    return Ray(vec3(0), lowerLeftCorner + u * horizontal + v * vertical);
  }

  vec3 pointAtParameter(float t, Ray ray) {
    return ray.origin + t * ray.direction;
  }
`;
