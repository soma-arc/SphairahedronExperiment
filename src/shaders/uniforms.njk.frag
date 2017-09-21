struct Camera {
    vec3 pos;
    vec3 target;
    float fov;
    vec3 up;
};

struct Sphere {
    vec3 center;
    vec2 r;
};

struct Plane {
    vec3 origin;
    vec3 normal;
};

uniform sampler2D u_accTexture;
uniform float u_textureWeight;
uniform float u_numSamples;
uniform vec2 u_resolution;
uniform Camera u_camera;
uniform Sphere u_prismSpheres[{{ numPrismSpheres }}];
uniform Plane u_prismPlanes[{{ numPrismPlanes }}];
uniform Sphere u_inversionSphere;
uniform Sphere u_spheirahedraSpheres[{{ numSpheirahedraSpheres }}];
uniform Sphere u_seedSpheres[{{ numSeedSpheres }}];
uniform Plane u_dividePlanes[{{ numDividePlanes }}];
uniform Sphere u_convexSpheres[{{ numDividePlanes }}];
uniform float u_fudgeFactor;
uniform float u_marchingThreshold;
uniform int u_maxIterations;
uniform int u_limitsetRenderingType;
uniform bool u_displaySpheirahedraSphere;
uniform bool u_displayConvexSphere;
uniform bool u_displayInversionSphere;
uniform bool u_displayBoundingSphere;
uniform bool u_castShadow;
uniform float u_boundingPlaneY;
uniform vec2 u_ao;
uniform Sphere u_boundingSphere;

const int RENDER_LIMIT_TERRAIN = 0;
const int RENDER_LIMIT_SEED_SPHERE = 1;
const int RENDER_LIMIT_SPHEIRAHEDRON = 2;
