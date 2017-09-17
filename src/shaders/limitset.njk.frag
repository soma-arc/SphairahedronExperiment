#version 300 es

precision mediump float;

{% include "./uniforms.njk.frag" %}

{% include "./color.njk.frag" %}

{% include "./raytrace.njk.frag" %}

const int ID_PRISM = 0;
const int ID_INI_SPHERES = 1;

float g_invNum;
vec4 distFunc(const vec3 pos) {
    vec4 hit = vec4(MAX_FLOAT, -1, -1, -1);
	{% if renderMode == 0 %}
	return DistUnion(hit, vec4(DistLimitsetTerrain(pos, g_invNum),
							   ID_PRISM, -1, -1));
	{% elif renderMode == 1 %}
	return DistUnion(hit, vec4(DistLimitsetFromSeedSpheres(pos + u_convexSphere.center, g_invNum),
							   ID_PRISM, -1, -1));
	{% else %}
	return DistUnion(hit, vec4(DistLimitsetFromSpheirahedra(pos + u_convexSphere.center, g_invNum),
							   ID_PRISM, -1, -1));
	{% endif %}
}

const vec2 NORMAL_COEFF = vec2(0.001, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 3000;
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

// This function is based on FractalLab's implementation
// http://hirnsohle.de/test/fractalLab/
float ambientOcclusion(vec3 p, vec3 n, float eps, float aoIntensity ){
    float o = 1.0;
    float k = aoIntensity;
    float d = 2.0 * eps;

    for (int i = 0; i < 5; i++) {
        o -= (d - distFunc(p + n * d).x) * k;
        d += eps;
        k *= 0.5;
    }

    return clamp(o, 0.0, 1.0);
}

const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec3 computeColor(const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo = NewIsectInfo();
    vec3 rayPos = rayOrg;

    vec3 l = vec3(0);

	float h = -999999.;
	{% if renderMode == 0 %}
	{% for n in range(0, numPrismSpheres) %}
	h = max(h, u_prismSpheres[{{ n }}].center.y * 1.01);
	{% endfor %}
	{% endif %}

    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < 8; depth++){
		float tmin = 0.;
		float tmax = MAX_FLOAT;
		bool hit = true;
		{% if renderMode == 0 %}
		hit = IntersectBoundingPlane(vec3(0, 1, 0), vec3(0, h, 0),
									 rayPos, rayDir,
									 tmin, tmax);
		{% endif %}
		if(hit)
			march(rayPos, rayDir, isectInfo, tmin, tmax);

		{% if renderMode == 0 %}
		if(u_displaySpheirahedraSphere) {
			{% for n in range(0, numPrismSpheres) %}
			IntersectSphere(ID_INI_SPHERES, {{ n }}, -1,
							Hsv2rgb(float({{ n }}) * 0.3, 1., 1.),
							u_prismSpheres[{{ n }}].center,
							u_prismSpheres[{{ n }}].r.x,
							rayPos, rayDir, isectInfo);
			{% endfor %}
		}
		{% else %}
		if(u_displaySpheirahedraSphere) {
			{% for n in range(0, numSpheirahedraSpheres) %}
			IntersectSphere(ID_INI_SPHERES, {{ n }}, -1,
							Hsv2rgb(float({{ n }}) * 0.3, 1., 1.),
							u_spheirahedraSpheres[{{ n }}].center - u_convexSphere.center,
							u_spheirahedraSpheres[{{ n }}].r.x,
							rayPos, rayDir, isectInfo);
			{% endfor %}
		}
		{% endif %}

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
                l += (diffuse + matColor * vec3(ambientOcclusion(isectInfo.intersection,
																 isectInfo.normal,
                                                                 .08, 2.2 ))) * coeff;
            }
        }
        break;
    }

    return l;
}

out vec4 outColor;
void main() {
    vec3 sum = vec3(0);
    float MAX_SAMPLES = 1.;
    for (float i = 0. ; i < MAX_SAMPLES ; i++) {
        vec2 coordOffset = Rand2n(gl_FragCoord.xy, i);
        vec3 ray = CalcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                           u_resolution, gl_FragCoord.xy + coordOffset);
        sum += computeColor(u_camera.pos, ray);
    }
    outColor = GammaCorrect(vec4(sum / MAX_SAMPLES, 1.0));
}
