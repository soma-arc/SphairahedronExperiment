import Sphere from './sphere.js';
import Plane from './plane.js';
import Vec3 from './vector3d.js';
import Vec2 from './vector2d.js';

const RT_3 = Math.sqrt(3);
const RT_3_INV = 1.0 / Math.sqrt(3);

const RENDER_PRISM_TMPL = require('./shaders/prism.njk.frag');
const RENDER_SPHEIRAHEDRA_TMPL = require('./shaders/spheirahedra.njk.frag');
const RENDER_LIMIT_SET_TMPL = require('./shaders/limitset.njk.frag');

export default class Spheirahedra {
    /**
     *
     * @param {number} zb
     * @param {number} zc
     */
    constructor(zb, zc) {
        this.zb = zb;
        this.zc = zc;
        this.updateListeners = [];

        this.selectedComponentId = -1;
        this.pointRadius = 0.02;
        this.lineWidth = 0.01;

        this.numFaces = 0;
        this.numSpheres = 0;
        this.numPlanes = 0;
        this.vertexIndexes = [];
        this.numVertexes = this.vertexIndexes.length;

        this.prismSpheres = new Array(3);
        this.planes = [];

//        this.update();
    }

    addUpdateListener(listener) {
        this.updateListeners.push(listener);
    }

    updated() {
        for (const listener of this.updateListeners) {
            listener();
        }
    }

    update() {
        this.computeSpheres();
        this.computeGenSpheres();
        this.computeVertexes();
        this.computeSeedSpheres();
        this.computeConvexSphere();

        this.updated();
    }

    computeSpheres() {}

    computeGenSpheres() {}

    computeVertexes() {
        this.vertexes = [];
        for (const vert of this.vertexIndexes) {
            this.vertexes.push(this.computeIdealVertex(this.gSpheres[vert[0]],
                                                       this.gSpheres[vert[1]],
                                                       this.gSpheres[vert[2]]));
        }
        this.p1 = this.inversionSphere.invertOnPoint(this.vertexes[0]);
        const p2 = this.inversionSphere.invertOnPoint(this.vertexes[1]);
        const p3 = this.inversionSphere.invertOnPoint(this.vertexes[2]);

        const v1 = p2.sub(this.p1);
        const v2 = p3.sub(this.p1);
        this.dividePlaneNormal = Vec3.cross(v1, v2).normalize();
        if (this.dividePlaneNormal.y < 0) {
            this.dividePlaneNormal = this.dividePlaneNormal.scale(-1);
        }
    }

    computeSeedSpheres() {
        this.seedSpheres = [];
        for (let i = 0; i < this.numVertexes; i++) {
            this.addSphereIfNotExists(this.seedSpheres,
                                      this.computeMinSeedSphere(this.vertexes[i], this.vertexes,
                                                                this.gSpheres[this.vertexIndexes[i][0]],
                                                                this.gSpheres[this.vertexIndexes[i][1]],
                                                                this.gSpheres[this.vertexIndexes[i][2]]));
        }
    }

    computeConvexSphere() {}

    getUniformLocations(gl, program) {
        const uniLocations = [];
        uniLocations.push(gl.getUniformLocation(program, 'u_zbzc'));
        uniLocations.push(gl.getUniformLocation(program, 'u_ui'));

        uniLocations.push(gl.getUniformLocation(program, 'u_inversionSphere.center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_inversionSphere.r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_convexSphere.center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_convexSphere.r'));

        uniLocations.push(gl.getUniformLocation(program, 'u_dividePlaneOrigin'));
        uniLocations.push(gl.getUniformLocation(program, 'u_dividePlaneNormal'));

        uniLocations.push(gl.getUniformLocation(program, 'u_numPrismSpheres'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numPrismPlanes'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numSeedSpheres'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numGenSpheres'));

        for (let i = 0; i < this.numSpheres; i++) {
            uniLocations.push(gl.getUniformLocation(program, 'u_prismSpheres[' + i + '].center'));
            uniLocations.push(gl.getUniformLocation(program, 'u_prismSpheres[' + i + '].r'));
        }

        for (let i = 0; i < this.numPlanes; i++) {
            uniLocations.push(gl.getUniformLocation(program, 'u_prismPlanes[' + i + '].origin'));
            uniLocations.push(gl.getUniformLocation(program, 'u_prismPlanes[' + i + '].normal'));
        }

        for (let i = 0; i < this.numFaces; i++) {
            uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[' + i + '].center'));
            uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[' + i + '].r'));
        }

        for (let i = 0; i < this.numVertexes; i++) {
            uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[' + i + '].center'));
            uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[' + i + '].r'));
        }

        return uniLocations;
    }

    setUniformValues(gl, uniLocations, uniI, scale) {
        gl.uniform2f(uniLocations[uniI++],
                     this.zb, this.zc);
        gl.uniform2f(uniLocations[uniI++],
                     this.pointRadius * scale, this.lineWidth * scale);

        gl.uniform3f(uniLocations[uniI++],
                     this.inversionSphere.center.x, this.inversionSphere.center.y, this.inversionSphere.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.inversionSphere.r, this.inversionSphere.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.convexSphere.center.x, this.convexSphere.center.y, this.convexSphere.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.convexSphere.r, this.convexSphere.rSq);

        gl.uniform3f(uniLocations[uniI++],
                     this.p1.x, this.p1.y, this.p1.z);
        gl.uniform3f(uniLocations[uniI++],
                     this.dividePlaneNormal.x, this.dividePlaneNormal.y, this.dividePlaneNormal.z);

        gl.uniform1i(uniLocations[uniI++], this.numSpheres);
        gl.uniform1i(uniLocations[uniI++], this.numPlanes);
        gl.uniform1i(uniLocations[uniI++], this.numVertexes);
        gl.uniform1i(uniLocations[uniI++], this.numFaces);
        for (let i = 0; i < this.numSpheres; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.prismSpheres[i].center.x, this.prismSpheres[i].center.y, this.prismSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.prismSpheres[i].r, this.prismSpheres[i].rSq);
        }

        for (let i = 0; i < this.numPlanes; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.planes[i].p1.x, this.planes[i].p1.y, this.planes[i].p1.z);
            gl.uniform3f(uniLocations[uniI++],
                         this.planes[i].normal.x, this.planes[i].normal.y, this.planes[i].normal.z);
        }

        for (let i = 0; i < this.numFaces; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.gSpheres[i].center.x, this.gSpheres[i].center.y, this.gSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.gSpheres[i].r, this.gSpheres[i].rSq);
        }

        for (let i = 0; i < this.numVertexes; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.seedSpheres[i].center.x, this.seedSpheres[i].center.y, this.seedSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.seedSpheres[i].r, this.seedSpheres[i].rSq);
        }

        return uniI;
    }

    /**
     *
     * @param {Vec3} x
     * @param {Vec3} y
     * @param {Sphere} a
     * @param {Sphere} b
     * @param {Sphere} c
     * @returns {Sphere}
     */
    computeSeedSphere(x, y, a, b, c) {
        const ab = b.center.sub(a.center);
        const ac = c.center.sub(a.center);
        const n = Vec3.cross(ab, ac);
        const k = y.sub(x).lengthSq() / (2 * Vec3.dot(y.sub(x), n));
        const center = x.add(n.scale(k));
        return new Sphere(center.x, center.y, center.z, Math.abs(k) * n.length());
    }

    addSphereIfNotExists(spheres, sphere) {
        for (const s of spheres) {
            if (Math.abs(s.r, sphere.r) < 0.00001 &&
                Vec3.distance(s.center, sphere.center) < 0.00001) {
                console.log('duplicate');
                return;
            }
        }
        spheres.push(sphere);
    }

    /**
     *
     * @param {Sphere} a
     * @param {Sphere} b
     * @param {Sphere} c
     * @returns {Vec3}
     */
    computeIdealVertex(a, b, c) {
        const AB = (a.center.lengthSq() - b.center.lengthSq() - a.rSq + b.rSq) * 0.5 -
              a.center.lengthSq() + Vec3.dot(a.center, b.center);
        const AC = (a.center.lengthSq() - c.center.lengthSq() - a.rSq + c.rSq) * 0.5 -
              a.center.lengthSq() + Vec3.dot(a.center, c.center);
        const x = -a.center.lengthSq() - b.center.lengthSq() + 2 * Vec3.dot(a.center, b.center);
        const y = -a.center.lengthSq() - c.center.lengthSq() + 2 * Vec3.dot(a.center, c.center);
        const z = -a.center.lengthSq() + Vec3.dot(a.center, b.center) +
              Vec3.dot(a.center, c.center) - Vec3.dot(b.center, c.center);
        const s = (AB * y - AC * z) / (x * y - z * z);
        const t = (AC * x - AB * z) / (x * y - z * z);
        return a.center.add((b.center.sub(a.center)).scale(s)).add((c.center.sub(a.center)).scale(t));
    }

    /**
     *
     * @param {Vec3} x
     * @param {} vertexes
     * @param {Sphere} a
     * @param {Sphere} b
     * @param {Sphere} c
     * @returns {Sphere}
     */
    computeMinSeedSphere(x, vertexes, a, b, c) {
        let minSphere = new Sphere(0, 0, 0, 99999999999);
        for (const ov of vertexes) {
            if (Vec3.distance(x, ov) < 0.000001) {
                // x === ov
                continue;
            }
            const s = this.computeSeedSphere(x, ov, a, b, c);
            if (s.r < minSphere.r) {
                minSphere = s;
            }
        }
        return minSphere;
    }

    select(mouse, scale) {
        const zbzc = new Vec2(this.zb, this.zc);
        if (Vec2.distance(mouse, new Vec2(this.zb, this.zc)) < 0.1) {
            this.selectedComponentId = Spheirahedra.POINT_ZB_ZC;
            this.diffToComponent = mouse.sub(zbzc);
            return;
        }

        this.selectedComponentId = -1;
    }

    move(mouse) {
        if (this.selectedComponentId === Spheirahedra.POINT_ZB_ZC) {
            const np = mouse.sub(this.diffToComponent);
            this.zb = np.x;
            this.zc = np.y;
            this.update();
            return true;
        }
        return false;
    }

    getShaderTemplateContext() {
        return {
            'numPrismSpheres': this.numSpheres,
            'numPrismPlanes': this.numPlanes,
            'numSpheirahedraSpheres': this.numFaces,
            'numSeedSpheres': this.numVertexes
        }
    }

    buildPrismShader() {
        return RENDER_PRISM_TMPL.render(this.getShaderTemplateContext());
    }

    buildSpheirahedraShader() {
        return RENDER_SPHEIRAHEDRA_TMPL.render(this.getShaderTemplateContext());
    }

    buildLimitsetShader() {
        return RENDER_LIMIT_SET_TMPL.render(this.getShaderTemplateContext());
    }

    static get POINT_ZB_ZC() {
        return 0;
    }

    static get PRISM_PLANES_333 () {
        // AB - CA - BC
        return [new Plane(new Vec3(0, 5, RT_3_INV),
                          new Vec3(1, 1, 0),
                          new Vec3(2, 2, -RT_3_INV),
                          new Vec3(RT_3 * 0.5, 0, 1.5).normalize()),
                new Plane(new Vec3(0, 3, -RT_3_INV),
                          new Vec3(1, 3, 0),
                          new Vec3(2, 2, RT_3_INV),
                          new Vec3(RT_3 * 0.5, 0, -1.5).normalize()),
                new Plane(new Vec3(-0.5, 0, 1),
                          new Vec3(-0.5, 1, 0),
                          new Vec3(-0.5, 2, 1),
                          new Vec3(-1, 0, 0))];
    }

    static get PRISM_PLANES_236 () {
        // AB - CA - BC
        return [new Plane(new Vec3(0.5, 5, RT_3 * 0.5),
                          new Vec3(1, 1, 0),
                          new Vec3(0.75, 2, RT_3 * 0.25),
                          new Vec3(1, 0, RT_3_INV).normalize()),
                new Plane(new Vec3(1, 0, 0),
                          new Vec3(0, 5, -RT_3 / 3),
                          new Vec3(-0.5, 2, -RT_3 * 0.5),
                          new Vec3(1, 0, -RT_3).normalize()),
                new Plane(new Vec3(0.5, 3, RT_3 * 0.5),
                          new Vec3(0, -10, 0),
                          new Vec3(-0.5, -3, -RT_3 * 0.5),
                          new Vec3(-1, 0, RT_3_INV).normalize())];
    }

    static get PRISM_PLANES_244 () {
        // AB - CA - BC
        return [new Plane(new Vec3(0, 5, 1),
                          new Vec3(0.5, 1, 0.5),
                          new Vec3(1, 2, 0),
                          new Vec3(0.5, 0, 0.5).normalize()),
                new Plane(new Vec3(0, 3, -1),
                          new Vec3(0.5, 3, -0.5),
                          new Vec3(1, 2, 0),
                          new Vec3(0.5, 0, -0.5).normalize()),
                new Plane(new Vec3(0, -7, 1),
                          new Vec3(0, -4, 0),
                          new Vec3(0, 8, -1),
                          new Vec3(-1, 0, 0))];
    }
}
