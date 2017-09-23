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
							out float t0, out float t1) {
	float d = -dot(p, n);
    float v = dot(n, rayDir);
    float t = -(dot(n, rayOrigin) + d) / v;
    if(THRESHOLD < t){
		if(v < 0.) {
			t0 = t;
			t1 = MAX_FLOAT;
		} else {
			t0 = 0.;
			t1 = t;
		}
		return true;
    }
    t0 = 0.;
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
    {% for n in range(0, numDividePlanes) %}
    d = max(DistPlane(pos, u_dividePlanes[{{ n }}].origin,
					  u_dividePlanes[{{ n }}].normal),
			d);
    {% endfor %}
    {% for n in range(0, numExcavationSpheres) %}
	d = max(-DistSphere(pos, u_excavationPrismSpheres[{{ n }}]),
			d);
	{% endfor %}
    return d;
}

float DistInfSpheirahedra(const vec3 pos) {
    float d = DistPrism(pos);
	{% for n in range(0, numPrismSpheres) %}
	d = max(-DistSphere(pos, u_prismSpheres[{{ n }}]),
			d);
	{% endfor %}
    return d;
}

float DistSpheirahedra(vec3 pos) {
    float d = -1.0;
    {% for n in range(0, numDividePlanes) %}
    d = max(d, DistSphere(pos, u_convexSpheres[{{ n }}]));
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
	float d;
    for(int i = 0; i < 1000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numPrismSpheres) %}
		if(distance(pos, u_prismSpheres[{{ n }}].center) < u_prismSpheres[{{ n }}].r.x) {
			invNum++;
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
			invNum++;
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
{% elif renderMode == 1 %}
float DistLimitsetFromSeedSpheres(vec3 pos, out float invNum) {
    float dr = 1.;
    invNum = 0.;
    for(int i = 0; i < 1000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numSpheirahedraSpheres) %}
		if(distance(pos, u_spheirahedraSpheres[{{ n }}].center) < u_spheirahedraSpheres[{{ n }}].r.x) {
			invNum++;
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
    for(int i = 0; i < 1000; i++) {
        if(u_maxIterations <= i) break;
        bool inFund = true;
		{% for n in range(0, numSpheirahedraSpheres) %}
		if(distance(pos, u_spheirahedraSpheres[{{ n }}].center) < u_spheirahedraSpheres[{{ n }}].r.x) {
			invNum++;
			SphereInvert(pos, dr,
						 u_spheirahedraSpheres[{{ n }}].center,
						 u_spheirahedraSpheres[{{ n }}].r);
			continue;
		}
		{% endfor %}
        if(inFund) break;
    }

    return DistSpheirahedra(pos) / abs(dr) * u_fudgeFactor;
}

{% endif %}
