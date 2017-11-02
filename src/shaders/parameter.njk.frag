#version 300 es

precision mediump float;

struct Sphere {
    vec3 center;
    vec2 r;
};

uniform vec2 u_resolution;
uniform vec3 u_geometry;
uniform vec2 u_zbzc; //[zb, zc]
uniform vec2 u_ui; //[pointRadius, lineWidth]

const float DISPLAY_GAMMA_COEFF = 1. / 2.2;
vec4 gammaCorrect(vec4 rgba) {
    return vec4((min(pow(rgba.r, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.g, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.b, DISPLAY_GAMMA_COEFF), 1.)),
                rgba.a);
}

vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

const float SQRT_3 = sqrt(3.);
const float SQRT_2 = sqrt(2.);
out vec4 outColor;
const float MAX_SAMPLES = 10.;
void main() {
    vec3 sum = vec3(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_geometry.z;
        position += u_geometry.xy;

		float x = position.x;
		float y = position.y;
		float xy = x * y;
		float xx = x * x;
		float yy = y * y;

		if (distance(position, u_zbzc) < u_ui.x) {
            // point (zb, zc)
            sum += vec3(1, 0, 0);
			continue;
        }

		{% for n in range(0, conditions|length) %}
		{% if n == 0 %}
		if (abs({{ conditions[n] }}) < u_ui.y) {
			sum += vec3(0, 1, 0);
		}
		{% else %}
		else if (abs({{ conditions[n] }}) < u_ui.y) {
			sum += vec3(0, 1, 0);
		}
		{% endif %}
		{% endfor %}

        {% if conditions|length > 0 %}
		if ( (
            {% for n in range(0, conditions|length) %}
            {% if n == 0 %}
            {{ conditions[n] }} > u_ui.y
            {% else %}
            && {{ conditions[n] }} > u_ui.y
            {% endif %}
            {% endfor %}
                )) {
			sum += vec3(0, 0.1, 0.1);
		}
        {% endif %}

		if (abs(position.x) < u_ui.y ||
			abs(position.y) < u_ui.y) {
            // z-axis and y-axis
            sum += vec3(0.7);
        }

		{% if regionCondition %}
		if({{ regionCondition | safe }}) {
            sum += vec3(0.5, 0.5, 0.);
        }
		{% endif %}
    }

    outColor = gammaCorrect(vec4(sum / MAX_SAMPLES, 1));
}
