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
    hit = (u_displayPrism) ? DistUnion(hit, vec4(DistInfSpheirahedraAll(pos), ID_PRISM, -1, -1)) : hit;
    return DistUnion(hit, vec4(DistLimitsetTerrain(pos, g_invNum),
                             ID_PRISM, -1, -1));
    // Sphere s;
    // s.r.x = 1.;
    //     return DistUnion(hit, vec4(DistSphere(pos, s),
    //                            ID_PRISM, -1, -1));
	{% elif renderMode == 1 %}
	return DistUnion(hit, vec4(DistLimitsetFromSeedSpheres(pos + u_boundingSphere.center, g_invNum),
							   ID_PRISM, -1, -1));
	{% else %}
	return DistUnion(hit, vec4(DistLimitsetFromSpheirahedra(pos + u_boundingSphere.center, g_invNum),
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
			isectInfo.matColor = Hsv2rgb((1., -0.13 + (g_invNum) * 0.01), 1., 1.);
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

float computeShadowFactor (const vec3 rayOrg, const vec3 rayDir,
                           const float mint, const float maxt, const float k) {
    float shadowFactor = 1.0;
    for(float t = mint ; t < maxt ;){
        float d = distFunc(rayOrg + rayDir * t).x;
        if(d < u_marchingThreshold) {
            shadowFactor = 0.;
            break;
        }

        shadowFactor = min(shadowFactor, k * d / t);
        t += d;
    }
    return clamp(shadowFactor, 0.0, 1.0);
}

const vec3 AMBIENT_FACTOR = vec3(0.3);
const vec3 LIGHT_DIR = normalize(vec3(0, 1, 0));
vec4 computeColor(const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo = NewIsectInfo();
    vec3 rayPos = rayOrg;

    vec3 l = vec3(0);
    float alpha = 1.;

    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < 8; depth++){
		float tmin = 0.;
		float tmax = MAX_FLOAT;
		bool hit = true;
		{% if renderMode == 0 %}
        hit = IntersectBoundingPlane(vec3(0, 1, 0), vec3(0, u_boundingPlaneY, 0),
		 							 rayPos, rayDir,
		 							 tmin, tmax);
		{% else %}
		hit = IntersectBoundingSphere(u_boundingSphere.center - u_boundingSphere.center,
                                      u_boundingSphere.r.x,
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
							u_spheirahedraSpheres[{{ n }}].center - u_boundingSphere.center,
							u_spheirahedraSpheres[{{ n }}].r.x,
							rayPos, rayDir, isectInfo);
			{% endfor %}
		}
        if(u_displayBoundingSphere) {
            IntersectSphere(ID_INI_SPHERES, 0, -1,
                            Hsv2rgb(0.3, 1., 1.),
                            u_boundingSphere.center - u_boundingSphere.center,
                            u_boundingSphere.r.x,
                            rayPos, rayDir, isectInfo);
        }
		{% endif %}

        if(isectInfo.hit) {
            vec3 matColor = isectInfo.matColor;
            bool transparent = false;
            transparent =  (isectInfo.objId == ID_INI_SPHERES) ?
                true : false;
            vec3 ambient = matColor * AMBIENT_FACTOR;

            if(transparent) {
                vec3 diffuse =  clamp((dot(isectInfo.normal, -u_lightDirection)), 0., 1.) * matColor;
                coeff *= transparency;
                l += (diffuse + ambient) * coeff;
                rayPos = isectInfo.intersection + rayDir * 0.000001 * 2.;
                isectInfo = NewIsectInfo();
                continue;
            } else {
                vec3 c = BRDF(matColor, u_metallicRoughness.x, u_metallicRoughness.y,
                              dielectricSpecular,
                              -u_lightDirection, -rayDir, isectInfo.normal);
                float k = u_castShadow ?
                    computeShadowFactor(isectInfo.intersection + 0.0001 * isectInfo.normal,
                                        -u_lightDirection,
                                        0.001, 5., 100.) : 1.;
                l += (c * k + ambient * ambientOcclusion(isectInfo.intersection,
                                                      isectInfo.normal,
                                                        u_ao.x, u_ao.y )) * coeff;
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
    vec3 sum = vec3(0);
    vec2 coordOffset = Rand2n(gl_FragCoord.xy, u_numSamples);
    vec3 ray = CalcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                       u_resolution, gl_FragCoord.xy + coordOffset);
    vec3 org = u_camera.pos;
    // vec3 rayOrtho = CalcRayOrtho(u_camera.pos, u_camera.target, u_camera.up, 1.0,
    //                              u_resolution, gl_FragCoord.xy + coordOffset, org);
    vec4 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution);
	outColor = vec4(mix(clamp(computeColor(org, ray), 0., 1.), texCol, u_textureWeight));
}
