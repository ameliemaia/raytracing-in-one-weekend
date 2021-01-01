export default `
  struct Ray {
    vec3 origin;
    vec3 direction;
  };

  vec3 pointAtParameter(float t, Ray ray) {
    return ray.origin + t * ray.direction;
  }
`;
