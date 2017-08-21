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
uniform Sphere u_iniSpheres[3];
uniform Sphere u_inversionSphere;
uniform Sphere u_spheirahedraSpheres[6];

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

out vec4 outColor;
const float MAX_SAMPLES = 20.;
void main() {
    vec3 sum = vec3(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_geometry.z;
        position += u_geometry.xy;

        if (distance(position, u_zbzc) < u_ui.x) {
            // point (zb, zc)
            sum += vec3(1, 0, 0);
        } else if (abs(-sqrt(3.) * position.x * position.x- 2. * sqrt(3.) * position.x * position.y + 90. - 51.0 * sqrt(3.)) < u_ui.y) {
            // -sqrt(3) zb^2 - 2 * sqrt(3) * zb * zc + 90 - 51 * sqrt(3)
            sum += vec3(0, 1, 0);
        } else if (abs(-3. * sqrt(3.) * position.x * position.x + 4. * sqrt(3.) * position.x * position.y + 90. - 48.0 * sqrt(3.)) < u_ui.y) {
            // -3sqrt(3) zb^2 + 4 * sqrt(3) * zb * zc + 90 - 48 * sqrt(3)
            sum += vec3(0, 1, 0);
        } else if (abs(position.x * position.x + 2. * position.x * position.y - 5. * position.y * position.y + (9. / 4.)) < u_ui.y) {
            // zb^2 + 2 zb zc - 5 * zc^2 + 9 / 4
            sum += vec3(0, 1, 0);
        } else if (abs(position.x) < u_ui.y ||
                   abs(position.y) < u_ui.y) {
            // z-axis and y-axis
            sum += vec3(0.7);
        } else if(position.x > 0. &&
                  (-sqrt(3.) * position.x * position.x- 2. * sqrt(3.) * position.x * position.y + 90. - 51.0 * sqrt(3.)) > 0. &&
                  (-3. * sqrt(3.) * position.x * position.x + 4. * sqrt(3.) * position.x * position.y + 90. - 48.0 * sqrt(3.)) > 0. &&
                  (position.x * position.x + 2. * position.x * position.y - 5. * position.y * position.y + (9. / 4.)) > 0.) {
            sum += vec3(0.3, 0.3, 0.);
        }
    }

    outColor = gammaCorrect(vec4(sum / MAX_SAMPLES, 1));
}
