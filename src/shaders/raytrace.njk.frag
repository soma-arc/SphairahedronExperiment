vec3 CalcRay (const vec3 eye, const vec3 target, const vec3 up, const float fov,
              const vec2 resolution, const vec2 coord){
    float imagePlane = (resolution.y * .5) / tan(fov * .5);
    vec3 v = normalize(target - eye);
    vec3 xaxis = normalize(cross(v, up));
    vec3 yaxis =  normalize(cross(v, xaxis));
    vec3 center = v * imagePlane;
    vec3 origin = center - (xaxis * (resolution.x  *.5)) - (yaxis * (resolution.y * .5));
    return normalize(origin + (xaxis * coord.x) + (yaxis * (resolution.y - coord.y)));
}

vec3 CalcRayOrtho (const vec3 eye, const vec3 target, const vec3 up, const float orthoWidth,
                   const vec2 resolution, const vec2 coord,
                   out vec3 rayOrigin){
    vec3 v = normalize(target - eye);
    vec3 xaxis = normalize(cross(v, up));
    vec3 yaxis =  normalize(cross(v, xaxis));
    vec2 orthoPlane = vec2(orthoWidth, orthoWidth * resolution.y / resolution.x);
    vec3 planeOrigin = eye - (xaxis * (orthoPlane.x * .5)) - (yaxis * (orthoPlane.y * .5));
    rayOrigin = planeOrigin + (xaxis * orthoPlane.x * coord.x / resolution.x) + (yaxis * orthoPlane.y * coord.y / resolution.y);
    return v;
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

IsectInfo NewIsectInfo() {
    IsectInfo isectInfo;
    isectInfo.objId = -1;
    isectInfo.objIndex = -1;
    isectInfo.objComponentId = -1;
    isectInfo.mint = MAX_FLOAT;
    isectInfo.maxt = 9999999.;
    isectInfo.hit = false;
    return isectInfo;
}

bool IntersectBoundingSphere(vec3 sphereCenter, float radius,
                             vec3 rayOrigin, vec3 rayDir,
                             out float t0, out float t1){
	vec3 v = rayOrigin - sphereCenter;
	float b = dot(rayDir, v);
	float c = dot(v, v) - radius * radius;
	float d = b * b - c;
	const float EPSILON = 0.0001;
	if(d >= 0.){
		float s = sqrt(d);
		float tm = -b - s;
		t0 = tm;
		if(tm <= EPSILON){
			tm = -b + s;
            t1 = tm;
			t0 = 0.;
		}else{
			t1 = -b + s;
		}
		if(EPSILON < tm){
			return true;
		}
	}
    t0 = 0.;
    t1 = MAX_FLOAT;
	return false;
}

bool IntersectBoundingPlane(const vec3 n, const vec3 p,
							const vec3 rayOrigin, const vec3 rayDir,
							inout float t0, inout float t1) {
	float d = -dot(p, n);
    float v = dot(n, rayDir);
    float t = -(dot(n, rayOrigin) + d) / v;
    if(THRESHOLD < t){
		if(v < 0.) {
			t0 = max(t, t0);
			t1 = MAX_FLOAT;
		} else {
			t0 = t0;
			t1 = t;
		}
		return true;
    }
    t0 = t0;
    t1 = MAX_FLOAT;
	return (v < 0.);
}

vec2 Rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec4 DistUnion(vec4 t1, vec4 t2) {
    return (t1.x < t2.x) ? t1 : t2;
}

vec4 DistSubtract(vec4 t1, vec4 t2) {
    return (t1.x > t2.x) ? t1 : t2;
}



float DistPlane(const vec3 pos, const vec3 p, const vec3 normal) {
    return dot(pos - p, normal);
}

void IntersectSphere(const int objId, const int objIndex, const int objComponentId,
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

float DistSphere(const vec3 pos, const Sphere sphere) {
    return distance(pos, sphere.center) - sphere.r.x;
}

float DistPrism(const vec3 pos) {
    float d = -1.;
	{% for n in range(0, numPrismPlanes) %}
	d = max(DistPlane(pos, u_prismPlanes[{{ n }}].origin,
					  u_prismPlanes[{{ n }}].normal),
			d);
	{% endfor %}
    return d;
}

{% if shaderType == SHADER_TYPE_PRISM or renderMode == 0 %}
float DistInfSpheirahedraAll(const vec3 pos) {
    float d = DistPrism(pos);
    {% for n in range(0, numExcavationSpheres) %}
	d = max(-DistSphere(pos, u_excavationPrismSpheres[{{ n }}]),
			d);
	{% endfor %}
	{% for n in range(0, numPrismSpheres) %}
	d = max(-DistSphere(pos, u_prismSpheres[{{ n }}]),
			d);
	{% endfor %}
    return d;
}
{% endif %}

float DistInfSpheirahedra(const vec3 pos) {
    float d = DistPrism(pos);
    {% for n in range(0, numDividePlanes) %}
    d = max(DistPlane(pos, u_dividePlanes[{{ n }}].origin,
					  u_dividePlanes[{{ n }}].normal),
			d);
    {% endfor %}
    {% for n in range(0, numExcavationSpheres) %}
	d = max(-DistSphere(pos, u_excavationPrismSpheres[{{ n }}]),
			d);
	{% endfor %}
	{% for n in range(0, numPrismSpheres) %}
	d = max(-DistSphere(pos, u_prismSpheres[{{ n }}]),
			d);
	{% endfor %}
    if(u_twoDividePlanes && u_prismSpheres[1].center.y > 0.) {
        float d2 = DistPrism(pos);
        d2 = max(-DistPlane(pos, u_prismSpheres[0].center,
                          vec3(0, -1, 0)),
                 d2);
        {% for n in range(0, numPrismSpheres) %}
        d2 = max(-DistSphere(pos, u_prismSpheres[{{ n }}]),
                 d2);
        {% endfor %}
    
        d = min(d, d2);
    }
    return d;
}

float DistInfOuterSphairahedron(const vec3 pos) {
    float d = DistPrism(pos);
    {% for n in range(0, numDividePlanes) %}
    d = max(DistPlane(pos, u_dividePlanes[{{ n }}].origin,
                      -u_dividePlanes[{{ n }}].normal),
            d);
    {% endfor %}
    {% for n in range(0, numExcavationSpheres) %}
	d = max(-DistSphere(pos, u_excavationPrismSpheres[{{ n }}]),
			d);
	{% endfor %}
	{% for n in range(0, numPrismSpheres) %}
	d = max(-DistSphere(pos, u_prismSpheres[{{ n }}]),
			d);
	{% endfor %}
    if(u_twoDividePlanes && u_prismSpheres[1].center.y > 0.) {
        float d2 = DistPrism(pos);
        d2 = max(-DistPlane(pos, u_prismSpheres[0].center,
                          vec3(0, -1, 0)),
                 d2);
        {% for n in range(0, numPrismSpheres) %}
        d2 = max(-DistSphere(pos, u_prismSpheres[{{ n }}]),
                 d2);
        {% endfor %}
    
        d = min(d, d2);
    }
    return d;
}

float DistSpheirahedra(vec3 pos) {
    float d = MAX_FLOAT;
    {% for n in range(0, numDividePlanes) %}
    d = min(d, DistSphere(pos, u_convexSpheres[{{ n }}]));
    {% endfor %}
    {% for n in range(0, numExcavationSpheres) %}
	d = max(-DistSphere(pos, u_excavationSpheres[{{ n }}]),
			d);
	{% endfor %}
	{% for n in range(0, numSpheirahedraSpheres) %}
    d = max(-DistSphere(pos, u_spheirahedraSpheres[{{ n }}]),
			d);
	{% endfor %}
    return d;
}

float DistOuterSphairahedron(vec3 pos) {
  float d = -MAX_FLOAT;
    {% for n in range(0, numDividePlanes) %}
    d = max(-DistSphere(pos, u_convexSpheres[{{ n }}]), d);
    {% endfor %}
    {% for n in range(0, numExcavationSpheres) %}
	d = max(-DistSphere(pos, u_excavationSpheres[{{ n }}]),
			d);
	{% endfor %}
	{% for n in range(0, numSpheirahedraSpheres) %}
    d = max(-DistSphere(pos, u_spheirahedraSpheres[{{ n }}]),
			d);
	{% endfor %}
    return d;
}

const float DIV_PI = 1.0 / PI;
const vec3 dielectricSpecular = vec3(0.04);

// This G term is used in glTF-WebGL-PBR
// Microfacet Models for Refraction through Rough Surfaces
float G1_GGX(float alphaSq, float NoX) {
    float tanSq = (1.0 - NoX * NoX) / max((NoX * NoX), 0.00001);
    return 2. / (1. + sqrt(1. + alphaSq * tanSq));
}

// 1 / (1 + delta(l)) * 1 / (1 + delta(v))
float Smith_G(float alphaSq, float NoL, float NoV) {
    return G1_GGX(alphaSq, NoL) * G1_GGX(alphaSq, NoV);
}

// Height-Correlated Masking and Shadowing
// Smith Joint Masking-Shadowing Function
float GGX_Delta(float alphaSq, float NoX) {
    return (-1. + sqrt(1. + alphaSq * (1. / (NoX * NoX) - 1.))) / 2.;
}

float SmithJoint_G(float alphaSq, float NoL, float NoV) {
    return 1. / (1. + GGX_Delta(alphaSq, NoL) + GGX_Delta(alphaSq, NoV));
}

float GGX_D(float alphaSq, float NoH) {
    float c = (NoH * NoH * (alphaSq - 1.) + 1.);
    return alphaSq / (c * c)  * DIV_PI;
}

vec3 computeIBL(vec3 diffuseColor, vec3 specularColor,
                vec3 reflection, vec3 L,
                float NoL, float NoV) {
    float mixFact = (exp(1. * NoL) - 1.) / (exp(1.) - 1.);
    vec3 diffuse = diffuseColor * mix(vec3(0.2), vec3(1), mixFact);

    vec2 brdf = textureLod(u_brdfLUT,
                           vec2(NoV,
                                u_metallicRoughness.y), 0.0).rg;
    float LoReflect = clamp(dot(L, reflection), 0.0, 1.0);
    mixFact = (exp(2. * LoReflect) - 1.)/(exp(2.) - 1.);
    vec3 specularLight = mix(vec3(0.1, 0.1, 0.3), vec3(1, 1, 1), mixFact);
    vec3 specular = specularLight * (specularColor * brdf.x + brdf.y);
    return diffuse + specular;
}

vec3 BRDF(vec3 baseColor, float metallic, float roughness, vec3 dielectricSpecular,
          vec3 L, vec3 V, vec3 N) {
    vec3 H = normalize(L+V);

    float LoH = clamp(dot(L, H), 0.0, 1.0);
    float NoH = clamp(dot(N, H), 0.0, 1.0);
    float VoH = clamp(dot(V, H), 0.0, 1.0);
    float NoL = clamp(dot(N, L), 0.0, 1.0);
    float NoV = abs(dot(N, V));

    vec3 F0 = mix(dielectricSpecular, baseColor, metallic);
    vec3 cDiff = mix(baseColor * (1. - dielectricSpecular.r),
                     BLACK,
                     metallic);
    float alpha = roughness * roughness;
    float alphaSq = alpha * alpha;

    // Schlick's approximation
    vec3 F = F0 + (vec3(1.) - F0) * pow((1. - VoH), 5.);

    vec3 diffuse = (vec3(1.) - F) * cDiff * DIV_PI;

    //float G = SmithJoint_G(alphaSq, NoL, NoV);
    float G = Smith_G(alphaSq, NoL, NoV);

    float D = GGX_D(alphaSq, NoH);

    vec3 specular = (F * G * D) / (4. * NoL * NoV);
    vec3  c = clamp((diffuse + specular) * NoL, 0.0, 1.0);
    c += computeIBL(cDiff, F0, normalize(reflect(-V, N)), L, NoL, NoV);
    return c;
}

struct SpotLight {
    vec3 position;
    vec3 direction;
    float cutOff;
    float outerCutOff;
  
    float constant;
    float linear;
    float quadratic;
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    
    vec3 power;
};

SpotLight g_spotLight;

vec3 BRDFSpotlight(vec3 baseColor, float metallic, float roughness, vec3 dielectricSpecular,
                   vec3 L, vec3 V, vec3 N, vec3 intersection) {
    vec3 H = normalize(L+V);

    float LoH = clamp(dot(L, H), 0.0, 1.0);
    float NoH = clamp(dot(N, H), 0.0, 1.0);
    float VoH = clamp(dot(V, H), 0.0, 1.0);
    float NoL = clamp(dot(N, L), 0.0, 1.0);
    float NoV = abs(dot(N, V));

    float theta = dot(normalize(g_spotLight.position - intersection), normalize(-g_spotLight.direction)); 
    float epsilon = g_spotLight.cutOff - g_spotLight.outerCutOff;
    float intensity = clamp((theta - g_spotLight.outerCutOff) / epsilon, 0.0, 1.0);

    float dist = length(g_spotLight.position - intersection);
    float attenuation = 1.0 / (g_spotLight.constant + g_spotLight.linear * dist + g_spotLight.quadratic * (dist * dist)); 
    
    vec3 F0 = mix(dielectricSpecular, baseColor, metallic);
    vec3 cDiff = mix(baseColor * (1. - dielectricSpecular.r),
                     BLACK,
                     metallic);
    float alpha = roughness * roughness;
    float alphaSq = alpha * alpha;

    // Schlick's approximation
    vec3 F = F0 + (vec3(1.) - F0) * pow((1. - VoH), 5.);

    vec3 diffuse = (vec3(1.) - F) * cDiff * DIV_PI;

    //float G = SmithJoint_G(alphaSq, NoL, NoV);
    float G = Smith_G(alphaSq, NoL, NoV);

    float D = GGX_D(alphaSq, NoH);

    vec3 specular = (F * G * D) / (4. * NoL * NoV);
    vec3  c = clamp((diffuse + specular) * NoL * attenuation * intensity, 0.0, 1.0);
    c += computeIBL(cDiff, F0, normalize(reflect(-V, N)), L, NoL, NoV);
    return c;
}

{% if shaderType == SHADER_TYPE_LIMITSET %}
void SphereInvert(inout vec3 pos, inout float dr, vec3 center, vec2 r) {
    vec3 diff = pos - center;
    float lenSq = dot(diff, diff);
    float k = r.y / lenSq;
    dr *= k; // (r * r) / lenSq
    pos = (diff * k) + center;
}

{% if renderMode == 0 %}
float DistLimitsetTerrain(vec3 pos, out float invNum) {
    float dr = 1.;
    invNum = 0.;
    g_sliceInvNum = 0.;
    float d;
    for(int i = 0; i < 2000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numPrismSpheres) %}
		if(distance(pos, u_prismSpheres[{{ n }}].center) < u_prismSpheres[{{ n }}].r.x) {
            invNum += (float({{ (n + 1) *  10 }}) + invNum) * u_colorWeight + 1.;
            g_sliceInvNum++;
			SphereInvert(pos, dr,
						 u_prismSpheres[{{ n }}].center,
						 u_prismSpheres[{{ n }}].r);
			continue;
		}
		{% endfor %}

		{% for n in range(0, numPrismPlanes) %}
		pos -= u_prismPlanes[{{ n }}].origin;
		d = dot(pos, u_prismPlanes[{{ n }}].normal);
		if(d > 0.) {
            invNum += (float({{ (n + 1 + numPrismSpheres) *  10 }}) + invNum) * u_colorWeight + 1.;
			pos -= 2. * d * u_prismPlanes[{{ n }}].normal;
			pos += u_prismPlanes[{{ n }}].origin;
			continue;
		}
		pos += u_prismPlanes[{{ n }}].origin;
		{% endfor %}

        if(inFund) break;
    }
    return DistInfSpheirahedra(pos) / abs(dr) * u_fudgeFactor;
}
float DistLimitsetOuterTerrain(vec3 pos, out float invNum) {
    float dr = 1.;
    invNum = 0.;
    g_sliceInvNum = 0.;
    float d;
    for(int i = 0; i < 2000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numPrismSpheres) %}
		if(distance(pos, u_prismSpheres[{{ n }}].center) < u_prismSpheres[{{ n }}].r.x) {
            invNum += (float({{ (n + 1) *  10 }}) + invNum) * u_colorWeight + 1.;
            g_sliceInvNum++;
			SphereInvert(pos, dr,
						 u_prismSpheres[{{ n }}].center,
						 u_prismSpheres[{{ n }}].r);
			continue;
		}
		{% endfor %}

		{% for n in range(0, numPrismPlanes) %}
		pos -= u_prismPlanes[{{ n }}].origin;
		d = dot(pos, u_prismPlanes[{{ n }}].normal);
		if(d > 0.) {
            invNum += (float({{ (n + 1 + numPrismSpheres) *  10 }}) + invNum) * u_colorWeight + 1.;
			pos -= 2. * d * u_prismPlanes[{{ n }}].normal;
			pos += u_prismPlanes[{{ n }}].origin;
			continue;
		}
		pos += u_prismPlanes[{{ n }}].origin;
		{% endfor %}

        if(inFund) break;
    }
    return DistInfOuterSphairahedron(pos) / abs(dr) * u_fudgeFactor;
}
{% elif renderMode == 1 %}
float DistLimitsetFromSeedSpheres(vec3 pos, out float invNum) {
    float dr = 1.;
    invNum = 0.;
    for(int i = 0; i < 1000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numSpheirahedraSpheres) %}
		if(distance(pos, u_spheirahedraSpheres[{{ n }}].center) < u_spheirahedraSpheres[{{ n }}].r.x) {
            invNum += float({{ (n + 1) *  n }}) * u_colorWeight + 1.;
			SphereInvert(pos, dr,
						 u_spheirahedraSpheres[{{ n }}].center,
						 u_spheirahedraSpheres[{{ n }}].r);
			continue;
		}
		{% endfor %}
        if(inFund) break;
    }

    float minDist = 9999999.;

	{% for n in range(0, numSeedSpheres) %}
	minDist = min(minDist,
				  (DistSphere(pos, u_seedSpheres[{{ n }}])) / abs(dr) * u_fudgeFactor);
	{% endfor %}

    return minDist;
}
{% else %}
float DistLimitsetFromSpheirahedra(vec3 pos, out float invNum) {
    float dr = 1.;
    invNum = 0.;
    g_sliceInvNum = 0.;
    for(int i = 0; i < 1000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numSpheirahedraSpheres) %}
		if(distance(pos, u_spheirahedraSpheres[{{ n }}].center) < u_spheirahedraSpheres[{{ n }}].r.x) {
                  g_sliceInvNum++;
            invNum += (float({{ (n + 1) *  10 }}) + invNum) * u_colorWeight + 1.;
			SphereInvert(pos, dr,
						 u_spheirahedraSpheres[{{ n }}].center,
						 u_spheirahedraSpheres[{{ n }}].r);
            continue;
		}
		{% endfor %}
        if(inFund) break;
    }

    return DistSpheirahedra(pos) / abs(dr) * u_fudgeFactor;
    //return DistOuterSphairahedron(pos) / abs(dr) * u_fudgeFactor;
}

{% endif %}
{% endif %}

