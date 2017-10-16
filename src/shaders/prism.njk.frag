#version 300 es

precision mediump float;

{% include "./uniforms.njk.frag" %}

{% include "./color.njk.frag" %}

{% include "./raytrace.njk.frag" %}

const int ID_PRISM = 0;
const int ID_INI_SPHERES = 1;

vec4 distFunc(const vec3 pos) {
    vec4 hit = vec4(MAX_FLOAT, -1, -1, -1);
    hit = DistUnion(hit,
                    u_displeyRawSpheirahedralPrism ?
                    vec4(DistInfSpheirahedraAll(pos), ID_PRISM, -1, -1) :
                    vec4(DistInfSpheirahedra(pos), ID_PRISM, -1, -1));
    return hit;
}

const vec2 NORMAL_COEFF = vec2(0.0001, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 3000;
const float MARCHING_THRESHOLD = 0.001;
void march(const vec3 rayOrg, const vec3 rayDir,
           inout IsectInfo isectInfo) {
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

float computeShadowFactor (const vec3 rayOrg, const vec3 rayDir,
                           const float mint, const float maxt, const float k) {
    float shadowFactor = 1.0;
    for(float t = mint ; t < maxt ;){
        float d = distFunc(rayOrg + rayDir * t).x;
        if(d < MARCHING_THRESHOLD) {
            shadowFactor = 0.;
            break;
        }

        shadowFactor = min(shadowFactor, k * d / t);
        t += d;
    }
    return clamp(shadowFactor, 0.0, 1.0);
}

const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec4 computeColor(const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo = NewIsectInfo();
    vec3 rayPos = rayOrg;

    vec3 l = vec3(0);
    float alpha = 1.;

    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < 8; depth++){
        march(rayPos, rayDir, isectInfo);
		if(u_displaySpheirahedraSphere) {
			{% for n in range(0, numPrismSpheres) %}
			IntersectSphere(ID_INI_SPHERES, {{ n }}, -1,
							Hsv2rgb(float({{ n }}) * 0.3, 1., 1.),
							u_prismSpheres[{{ n }}].center,
							u_prismSpheres[{{ n }}].r.x*1.00001,
							rayPos, rayDir, isectInfo);
			{% endfor %}
		}
		if(u_displayInversionSphere) {
			IntersectSphere(ID_INI_SPHERES, -1, -1,
							vec3(0.7),
							u_inversionSphere.center,
							u_inversionSphere.r.x * 1.000001,
							rayPos, rayDir, isectInfo);
		}
        if(isectInfo.hit) {
            vec3 matColor = isectInfo.matColor;
            vec3 diffuse =  clamp(dot(isectInfo.normal, LIGHT_DIR), 0., 1.) * matColor;
            vec3 ambient = matColor * AMBIENT_FACTOR;
            bool transparent = false;
            transparent =  (isectInfo.objId == ID_INI_SPHERES) ?
                true : false;

            if(transparent) {
                coeff *= transparency;
                l += (diffuse + ambient) * coeff;
                rayPos = isectInfo.intersection + rayDir * 0.000001 * 2.;
                isectInfo = NewIsectInfo();
                continue;
            } else {
                // float k = computeShadowFactor(isectInfo.intersection + 0.001 * isectInfo.normal,
                //                               LIGHT_DIR,
                //                               0.001, 30., 60.);
                l += (diffuse + ambient) * coeff;
                break;
            }
        }
        //        alpha = 0.;
        break;
    }

    return vec4(l, alpha);
}

out vec4 outColor;
void main() {
    vec4 sum = vec4(0);
    float MAX_SAMPLES = 5.;
    for (float i = 0. ; i < MAX_SAMPLES ; i++) {
        vec2 coordOffset = Rand2n(gl_FragCoord.xy, i);
        vec3 ray = CalcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                           u_resolution, gl_FragCoord.xy + coordOffset);
        sum += computeColor(u_camera.pos, ray);
    }
    outColor = sum / MAX_SAMPLES;
}
