export default `
  struct Camera {
    vec3 lowerLeftCorner;
    vec3 horizontal;
    vec3 vertical;
    float aspect;
    vec3 origin;
  };

  Camera createCamera(vec3 origin, vec3 lookat, vec3 up, float aspect) {
    float theta = fov * (PI / 180.0);
    float halfHeight = tan(theta / 2.0);
    float halfWidth = aspect * halfHeight;

    vec3 w = normalize(origin - lookat);
    vec3 u = normalize(cross(up, w));
    vec3 v = cross(w, u);

    vec3 lowerLeftCorner = origin - halfWidth * u - halfHeight * v - w;
    vec3 horizontal = 2.0 * halfWidth * u;
    vec3 vertical = 2.0 * halfHeight * v;

    return Camera(
      lowerLeftCorner,
      horizontal,
      vertical,
      aspect,
      origin
    );
  }
`;
