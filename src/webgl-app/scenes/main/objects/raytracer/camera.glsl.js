export default `
  struct Camera {
    vec3 lowerLeftCorner;
    vec3 horizontal;
    vec3 vertical;
    float aspect;
    vec3 origin;
    float lensRadius;
    vec3 u;
    vec3 v;
  };

  struct Ray {
    vec3 origin;
    vec3 direction;
  };

  vec2 randomInUnitDisk() {
    float x = rand(vUv + seed.xy);
    float y = rand(vUv + seed.xz);
    float r = mix(-1.0, 1.0, rand(vUv + seed.yw));
	  return r * vec2(sin(x * TWO_PI), cos(y * TWO_PI));
  }

  Ray getRay(float u, float v, Camera camera) {
    vec2 rd = camera.lensRadius * randomInUnitDisk();
    vec3 offset = camera.u * rd.x + camera.v * rd.y;
    return Ray(camera.origin + offset, normalize(camera.lowerLeftCorner + u * camera.horizontal + v * camera.vertical - camera.origin - offset));
  }

  vec3 pointAtParameter(float t, Ray ray) {
    return ray.origin + t * ray.direction;
  }


  Camera createCamera(vec3 origin, vec3 lookat, vec3 up, float aspect, float aperture, float focusDistance) {
    Camera camera;

    float theta = fov * (PI / 180.0);
    float halfHeight = tan(theta / 2.0);
    float halfWidth = aspect * halfHeight;

    vec3 w = normalize(origin - lookat);
    camera.u = normalize(cross(up, w));
    camera.v = cross(w, camera.u);

    camera.aspect = aspect;
    camera.lowerLeftCorner = origin - halfWidth * focusDistance * camera.u - halfHeight * focusDistance * camera.v - focusDistance * w;
    camera.horizontal = 2.0 * halfWidth * focusDistance * camera.u;
    camera.vertical = 2.0 * halfHeight * focusDistance * camera.v;
    camera.origin = origin;
    camera.lensRadius = aperture / 2.0;

    return camera;
  }
`;
