#version 300 es

precision mediump float;

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

uniform vec2 u_resolution;
uniform Camera u_camera;
uniform Sphere u_iniSpheres[3];
uniform Sphere u_inversionSphere;
uniform Sphere u_convexSphere;
uniform Sphere u_spheirahedraSpheres[6];
uniform Sphere u_seedSpheres[8];
uniform int u_numPrismSpheres;
uniform int u_numPrismPlanes;
uniform int u_numGenSpheres;
uniform int u_numSeedSpheres;

vec3 calcRay (const vec3 eye, const vec3 target, const vec3 up, const float fov,
              const vec2 resolution, const vec2 coord){
    float imagePlane = (resolution.y * .5) / tan(fov * .5);
    vec3 v = normalize(target - eye);
    vec3 xaxis = normalize(cross(v, up));
    vec3 yaxis =  normalize(cross(v, xaxis));
    vec3 center = v * imagePlane;
    vec3 origin = center - (xaxis * (resolution.x  *.5)) - (yaxis * (resolution.y * .5));
    return normalize(origin + (xaxis * coord.x) + (yaxis * (resolution.y - coord.y)));
}

const float DISPLAY_GAMMA_COEFF = 1. / 2.2;
vec4 gammaCorrect(vec4 rgba) {
    return vec4((min(pow(rgba.r, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.g, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.b, DISPLAY_GAMMA_COEFF), 1.)),
                rgba.a);
}

vec3 hsv2rgb(float h, float s, float v){
    vec3 c = vec3(h, s, v);
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

struct IsectInfo {
    int objId;
    int objIndex;
    int objComponentId;
    vec3 normal;
    vec3 intersection;
    float mint;
    float maxt;
    vec3 matColor;
    bool hit;
};

float MAX_FLOAT = 1e20;
const float THRESHOLD = 0.001;

IsectInfo newIsectInfo() {
    IsectInfo isectInfo;
    isectInfo.objId = -1;
    isectInfo.objIndex = -1;
    isectInfo.objComponentId = -1;
    isectInfo.mint = MAX_FLOAT;
    isectInfo.maxt = 9999999.;
    isectInfo.hit = false;
    return isectInfo;
}

bool intersectBBox(vec3 rayOrg, vec3 rayDir, vec3 boxMin, vec3 boxMax,
                  out float hit0, out float hit1, out bool inBox) {
	float t0 = -1000000.0, t1 = 1000000.0;
    hit0 = t0;
    hit1 = t1;
    inBox = false;
    vec3 tNear = (boxMin - rayOrg) / rayDir;
    vec3 tFar  = (boxMax - rayOrg) / rayDir;

    if (tNear.x > tFar.x) {
        float tmp = tNear.x;
        tNear.x = tFar.x;
        tFar.x = tmp;
    }

    t0 = max(tNear.x, t0);
    t1 = min(tFar.x, t1);


    if (tNear.y > tFar.y) {
        float tmp = tNear.y;
        tNear.y = tFar.y;
        tFar.y = tmp;
    }
    t0 = max(tNear.y, t0);
    t1 = min(tFar.y, t1);

    if (tNear.z > tFar.z) {
        float tmp = tNear.z;
        tNear.z = tFar.z;
        tFar.z = tmp;
    }
    t0 = max(tNear.z, t0);
    t1 = min(tFar.z, t1);

    if (t0 <= t1 && 0. < t1) {
        if(t0 < 0.) inBox = true;
        hit0 = t0;
        hit1 = t1;
        return true;
    }
    return false;
}

vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec4 distUnion(vec4 t1, vec4 t2) {
    return (t1.x < t2.x) ? t1 : t2;
}

float distPlane(const vec3 pos, const vec3 p, const vec3 normal) {
    return dot(pos - p, normal);
}

const int ID_PRISM = 0;
const int ID_INI_SPHERES = 1;

float distPrism(const vec3 pos) {
    float d = distPlane(pos, vec3(1, 0 ,0), normalize(vec3(sqrt(3.) * .5, 0., 1.5)));
    d = max(distPlane(pos, vec3(1, 0 ,0), normalize(vec3(sqrt(3.) * .5, 0., -1.5))), d);
    d = max(distPlane(pos, vec3(-0.5, 0 ,0), normalize(vec3(-1, 0, 0))), d);
    return d;
}

float distSphere(const vec3 pos, const Sphere sphere, vec3 offset) {
    return distance(pos, sphere.center + offset) - sphere.r.x;
}

float distInfSpheirahedra(const vec3 pos) {
    float d = distPrism(pos);
    d = max(-distSphere(pos, u_iniSpheres[0], vec3(0)), d);
    d = max(-distSphere(pos, u_iniSpheres[1], vec3(0)), d);
    d = max(-distSphere(pos, u_iniSpheres[2], vec3(0)), d);
    return d;
}

float distSpheirahedra(vec3 pos) {
    Sphere s;
    float d = distSphere(pos, u_convexSphere, -u_convexSphere.center);
    // for(int index = 0; index < 6 ; index++) {
    //     if(u_numGenSpheres <= index) break;
    //     d = max(-distSphere(pos, u_spheirahedraSpheres[index], -u_convexSphere.center), d);
    // }
    d = max(-distSphere(pos, u_spheirahedraSpheres[0], -u_convexSphere.center), d);
    d = max(-distSphere(pos, u_spheirahedraSpheres[1], -u_convexSphere.center), d);
    d = max(-distSphere(pos, u_spheirahedraSpheres[2], -u_convexSphere.center), d);
    d = max(-distSphere(pos, u_spheirahedraSpheres[3], -u_convexSphere.center), d);
    if(u_numGenSpheres <= 4) return d;
    d = max(-distSphere(pos, u_spheirahedraSpheres[4], -u_convexSphere.center), d);
    d = max(-distSphere(pos, u_spheirahedraSpheres[5], -u_convexSphere.center), d);
    return d;
}

void intersectSphere(const int objId, const int objIndex, const int objComponentId,
                     const vec3 matColor,
                     const vec3 sphereCenter, const float radius,
                     const vec3 rayOrigin, const vec3 rayDir, inout IsectInfo isectInfo){
    vec3 v = rayOrigin - sphereCenter;
    float b = dot(rayDir, v);
    float c = dot(v, v) - radius * radius;
    float d = b * b - c;
    if(d >= 0.){
        float s = sqrt(d);
        float t = -b - s;
        if(t <= THRESHOLD) t = -b + s;
        if(THRESHOLD < t && t < isectInfo.mint){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.matColor = matColor;
            isectInfo.mint = t;
            isectInfo.intersection = (rayOrigin + t * rayDir);
            isectInfo.normal = normalize(isectInfo.intersection - sphereCenter);
            isectInfo.hit = true;
        }
    }
}

vec4 distFunc(const vec3 pos) {
    vec4 hit = vec4(MAX_FLOAT, -1, -1, -1);
    hit = distUnion(hit, vec4(distSpheirahedra(pos), ID_PRISM, -1, -1));
    return hit;
}

const vec2 NORMAL_COEFF = vec2(0.00001, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 3000;
const float MARCHING_THRESHOLD = 0.0001;
void march(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    float rayLength = 0.;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec4 dist = vec4(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > isectInfo.maxt ||
           rayLength > isectInfo.mint) break;
        dist = distFunc(rayPos);
        rayLength += dist.x;
        rayPos = rayOrg + rayDir * rayLength;
        if(dist.x < MARCHING_THRESHOLD) {
            isectInfo.objId = int(dist.y);
            //isectInfo.objIndex = int(dist.z);
            //isectInfo.objComponentId = int(dist.w);
            isectInfo.matColor = vec3(0.7);
            isectInfo.intersection = rayPos;
            isectInfo.normal = computeNormal(rayPos);
            isectInfo.mint = rayLength;
            isectInfo.hit = true;
            break;
        }
    }
}

const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec3 computeColor(const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo = newIsectInfo();
    vec3 rayPos = rayOrg;

    vec3 l = vec3(0);

    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < 8; depth++){
        march(rayPos, rayDir, isectInfo);
        for(int i = 0; i < 6 ; i++) {
            if(u_numGenSpheres <= i) break;
            intersectSphere(ID_INI_SPHERES, i, -1,
                            hsv2rgb(float(i) * 0.3, 1., 1.),
                            u_spheirahedraSpheres[i].center -u_convexSphere.center,
                            u_spheirahedraSpheres[i].r.x*1.00001,
                            rayPos, rayDir, isectInfo);
        }
        // for(int i = 0; i < 8 ; i++) {
        //     intersectSphere(ID_INI_SPHERES, i, -1,
        //                     hsv2rgb(float(i) * 0.3, 1., 1.),
        //                     u_seedSpheres[i].center -u_convexSphere.center,
        //                     u_seedSpheres[i].r.x * 1.0000,
        //                     rayPos, rayDir, isectInfo);
        // }
        // intersectSphere(ID_INI_SPHERES, -1, -1,
        //                 vec3(0.7),
        //                 u_convexSphere.center -u_convexSphere.center,
        //                 u_convexSphere.r.x * 1.000001,
        //                 rayPos, rayDir, isectInfo);

        if(isectInfo.hit) {
            vec3 matColor = isectInfo.matColor;
            vec3 diffuse =  clamp(dot(isectInfo.normal, LIGHT_DIR), 0., 1.) * matColor;
            vec3 ambient = matColor * AMBIENT_FACTOR;

            bool transparent =  (isectInfo.objId == ID_INI_SPHERES) ?
                true : false;
            if(transparent) {
                coeff *= transparency;
                l += (diffuse + ambient) * coeff;
                rayPos = isectInfo.intersection + rayDir * 0.00000001 * 2.;
                isectInfo = newIsectInfo();
                continue;
            } else {
                l += (diffuse + ambient) * coeff;
            }
        }
        break;
    }

    return l;
}

out vec4 outColor;
void main() {
    vec3 sum = vec3(0);
    float MAX_SAMPLES = 10.;
    for (float i = 0. ; i < MAX_SAMPLES ; i++) {
        vec2 coordOffset = rand2n(gl_FragCoord.xy, i);
        vec3 ray = calcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                           u_resolution, gl_FragCoord.xy + coordOffset);
        sum += computeColor(u_camera.pos, ray);
    }
    outColor = gammaCorrect(vec4(sum / MAX_SAMPLES, 1.0));
}
