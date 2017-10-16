#version 300 es

precision mediump float;

{% include "./uniforms.njk.frag" %}

{% include "./color.njk.frag" %}

{% include "./raytrace.njk.frag" %}


vec3 ortho(vec3 v) {
    //  See : http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
    return abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)  : vec3(0.0, -v.z, v.y);
}

float g_numRndCall = 1.;
vec3 getSampleBiased(vec3  dir, float power) {
    dir = normalize(dir);
    vec3 o1 = normalize(ortho(dir));
    vec3 o2 = normalize(cross(dir, o1));
    vec2 r = Rand2n(gl_FragCoord.xy - dir.xy, u_numSamples + g_numRndCall);
    g_numRndCall++;
    r.x=r.x*2.*PI;
    r.y=pow(r.y,1.0/(power+1.0));
    float oneminus = sqrt(1.0-r.y*r.y);
    return cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;
}

vec3 getSample(vec3 dir) {
    return getSampleBiased(dir,0.0); // <- unbiased!
}

vec3 getCosineWeightedSample(vec3 dir) {
    return getSampleBiased(dir,1.0);
}

const int ID_PRISM = 0;
const int ID_INI_SPHERES = 1;

float g_invNum;
vec4 distFunc(const vec3 pos) {
    vec4 hit = vec4(MAX_FLOAT, -1, -1, -1);
	{% if renderMode == 0 %}
	return DistUnion(hit, vec4(DistLimitsetTerrain(pos, g_invNum),
							   ID_PRISM, -1, -1));
	{% elif renderMode == 1 %}
	return DistUnion(hit, vec4(DistLimitsetFromSeedSpheres(pos + u_inversionSphere.center, g_invNum),
							   ID_PRISM, -1, -1));
	{% else %}
	return DistUnion(hit, vec4(DistLimitsetFromSpheirahedra(pos + u_inversionSphere.center, g_invNum),
							   ID_PRISM, -1, -1));
	{% endif %}
}

const vec2 NORMAL_COEFF = vec2(0.001, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 1000;
const float MARCHING_THRESHOLD = 0.001;
void march(const vec3 rayOrg, const vec3 rayDir,
           inout IsectInfo isectInfo,
		   float tmin, float tmax) {
    float rayLength = tmin;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec4 dist = vec4(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > tmax) break;
        dist = distFunc(rayPos);
        rayLength += dist.x;
        rayPos = rayOrg + rayDir * rayLength;
        if(dist.x < u_marchingThreshold) {
            isectInfo.objId = int(dist.y);
            //isectInfo.objIndex = int(dist.z);
            //isectInfo.objComponentId = int(dist.w);
			isectInfo.matColor = Hsv2rgb(min(1., -0.13 + (g_invNum) * 0.01), 1., 1.);
            isectInfo.intersection = rayPos;
            isectInfo.normal = computeNormal(rayPos);
            isectInfo.mint = rayLength;
            isectInfo.hit = true;
            break;
        }
    }
}

vec4 skyColor(vec3 dir){
    return vec4(0.6, 0.6, 0.6, 1);
}

const vec3 AMBIENT_FACTOR = vec3(0.3);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec4 computeColor(const vec3 rayOrg, vec3 rayDir) {
    IsectInfo isectInfo = NewIsectInfo();
    vec3 rayPos = rayOrg;
    float alpha = 1.;
    vec4 l = vec4(1, 1, 1, 0);

    float tmin = 0.;
    float tmax = MAX_FLOAT;
    for(int depth = 0 ; depth < 4; depth++){
        march(rayPos, rayDir, isectInfo, tmin, tmax);

        if(isectInfo.hit) {
            vec4 matColor = vec4(isectInfo.matColor, 1);

            const float albedo = 1.0;
            rayDir = getCosineWeightedSample(isectInfo.normal);
            l *= matColor * albedo;
            l.a = 1.;
            rayPos = isectInfo.intersection + isectInfo.normal * 0.001 * 2.;
            isectInfo = NewIsectInfo();
            tmax = 10.;
        } else {
            return l * skyColor( rayDir );
        }
    }

    return vec4(0, 0, 0, alpha);
}

out vec4 outColor;
void main() {
    vec3 sum = vec3(0);
    vec2 coordOffset = Rand2n(gl_FragCoord.xy, u_numSamples);
    vec3 ray = CalcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                       u_resolution, gl_FragCoord.xy + coordOffset);
    vec3 org = u_camera.pos;
    // vec3 rayOrtho = CalcRayOrtho(u_camera.pos, u_camera.target, u_camera.up, 1.0,
    //                              u_resolution, gl_FragCoord.xy + coordOffset, org);
    vec4 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution);
    
	outColor = vec4(mix(computeColor(org, ray), texCol, u_textureWeight));
}
