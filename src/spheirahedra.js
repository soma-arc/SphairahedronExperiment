import Sphere from './sphere.js';
import Plane from './plane.js';
import Vec3 from './vector3d.js';
import Vec2 from './vector2d.js';

const CSG = require('@jscad/csg').CSG;

const RT_3 = Math.sqrt(3);
const RT_3_INV = 1.0 / Math.sqrt(3);

const RENDER_PRISM_TMPL = require('./shaders/prism.njk.frag');
const RENDER_SPHEIRAHEDRA_TMPL = require('./shaders/spheirahedra.njk.frag');
const RENDER_LIMIT_SET_TMPL = require('./shaders/limitset.njk.frag');
const RENDER_PARAMETER_SPACE_TMPL = require('./shaders/parameter.njk.frag');

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
        this.numDividePlanes = 1;
        this.numExcavationSpheres = 0;
        this.enableSlice = false;
        this.currentSliceIndex = 0;
        this.maxSlicePlanes = 12;
        this.slicePlanes = Spheirahedra.SLICE_PLANES_FROM_333;
        this.quasiSphereSlicePlane = new Plane(new Vec3(0, 0, 0),
                                               new Vec3(0, 0, 0),
                                               new Vec3(0, 0, 0),
                                               new Vec3(1, 0, 0));
        this.quasiSphereSlicePlaneFlipNormal = false;
        this.useFlashLight = false;

        this.prismSpheres = new Array(3);
        this.planes = [];
        this.boundingPlanes = [];

        //        this.update();
        this.constrainsInversionSphere = true;
        this.inversionSphere = new Sphere(0, 0, 0, 1);

        this.bboxMin = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
        this.bboxMax = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];

        this.twoDividePlanes = false;
    }

    toJson() {
        const prismPlanes = this.planes.map((p) => { return p.toJson(); });
        const prismSpheres = this.prismSpheres.map((s) => { return s.toJson(); });
        const finiteSpheres = this.gSpheres.map((s) => { return s.toJson(); });
        const divPlanes = this.dividePlanes.map((p) => { return p.toJson(); })
        const convexSpheres = this.convexSpheres.map((p) => { return p.toJson(); })
        const boundingSphere = this.boundingSphere.toJson();

        const intersections = [];
        const planeIntersectionIndexes3 = [[0, 1], [0, 2], [1, 2]];
        const planeIntersectionIndexes4 = [[0, 1], [0, 3],
                                           [2, 1], [2, 3]];
        if (this.planes.length === 3) {
            for (const indexes of planeIntersectionIndexes3) {
                intersections.push(Plane.computeIntersection(this.planes[indexes[0]],
                                                             this.planes[indexes[1]]));
            }
        } else if (this.planes.length === 4) {
            for (const indexes of planeIntersectionIndexes4) {
                intersections.push(Plane.computeIntersection(this.planes[indexes[0]],
                                                             this.planes[indexes[1]]));
            }
        }

        for (const s of this.prismSpheres) {
            this.bboxMin[1] = Math.min(this.bboxMin[1], s.center.y - 0.1);
            this.bboxMax[1] = Math.max(this.bboxMax[1], s.center.y + 0.1);
        }

        const data = {
            'zb': this.zb,
            'zc': this.zc,
            'inversionSphere': this.inversionSphere.toJson(),
            'prismPlanes': prismPlanes,
            'prismSpheres': prismSpheres,
            'finiteSpheres': finiteSpheres,
            'dividePlanes': divPlanes,
            'convexSpheres': convexSpheres,
            'boundingSphere': boundingSphere,
            'boundingPlanes': this.boundingPlanes.map((p) => { return p.toJson(); }),
            'bboxMin': this.bboxMin,
            'bboxMax': this.bboxMax,
        };

        return data;
    }

    buildSpheirahedronMeshWithCSG() {
        let sphairahedra;
        const k = 5;
        for (const s of this.convexSpheres) {
            // When the radius of convex sphere is large,
            // the computation of sphairahedron may be failed
            if (s.r > 9999999) return;
            if (sphairahedra === undefined) {
                const c = s.center.sub(this.boundingSphere.center).scale(k);
                sphairahedra = CSG.sphere({
                    center: [c.x, c.y, c.z],
                    radius: s.r * k,
                    resolution: 64
                });
            } else {
                const c = s.center.sub(this.boundingSphere.center).scale(k);
                sphairahedra = sphairahedra.union(CSG.sphere({
                    center: [c.x, c.y, c.z],
                    radius: s.r * k,
                    resolution: 64
                }));
            }
        }

        for (const s of this.gSpheres) {
            const c = s.center.sub(this.boundingSphere.center).scale(k);
            sphairahedra = sphairahedra.subtract(CSG.sphere({
                center: [c.x, c.y, c.z],
                radius: s.r * k * 1.001,
                resolution: 64
            }));
        }
        return sphairahedra;
    }

    buildPrismMeshWithCSG() {
        const cube = CSG.cube({
            center: [0, 0, 0],
            radius: [10, 10, 10]
        });
        let sphairahedralPrism = cube;
        for (const p of this.planes) {
            sphairahedralPrism = sphairahedralPrism.cutByPlane(CSG.Plane.fromNormalAndPoint(
                [p.normal.x, p.normal.y, p.normal.z],
                [p.p1.x, p.p1.y, p.p1.z]));
        }
        for (const p of this.dividePlanes) {
            sphairahedralPrism = sphairahedralPrism.cutByPlane(CSG.Plane.fromNormalAndPoint(
                [p.normal.x, p.normal.y, p.normal.z],
                [p.p1.x, p.p1.y, p.p1.z]));
        }

        let minZ = 10000;
        for (const s of this.prismSpheres) {
            sphairahedralPrism = sphairahedralPrism.subtract(CSG.sphere({
                center: [s.center.x, s.center.y, s.center.z],
                radius: s.r,
                resolution: 64
            }));
            minZ = Math.min(minZ, s.center.y);
        }

        sphairahedralPrism = sphairahedralPrism.cutByPlane(CSG.Plane.fromNormalAndPoint(
            [0, -1, 0],
            [0, minZ - 1, 0]));
        return sphairahedralPrism;
    }

    invertSphairahedralPrismMesh() {
        const invertedSphairahedron = new Spheirahedra(0, 0);

        const invPlane = this.planes[2];
        const newPlanes = [];
        for (const p of this.planes) {
            newPlanes.push(invPlane.invertOnPlane(p));
        }
        invertedSphairahedron.planes = newPlanes;
        console.log(this.planes);
        console.log(newPlanes);

        const newDividePlanes = []
        for (const p of this.dividePlanes) {
            newDividePlanes.push(invPlane.invertOnPlane(p));
        }
        invertedSphairahedron.dividePlanes = newDividePlanes;

        const newSpheres = [];
        for (const s of this.prismSpheres) {
            newSpheres.push(invPlane.invertOnSphere(s));
        }
        invertedSphairahedron.prismSpheres = newSpheres;

        return invertedSphairahedron.buildPrismMeshWithCSG();
    }

    invertedSphairahedronMesh() {
        const index = 1;
        const inversionSphere = this.prismSpheres[index];

        const spheres = [];

        for (let i = 0; i < this.prismSpheres.length; i++) {
            if (index === i) continue;
            spheres.push(inversionSphere.invertOnSphere(this.prismSpheres[i]));
        }

        for (const p of this.planes) {
            spheres.push(inversionSphere.invertOnPlane(p));
        }

        const divideSpheres = [];
        for (const p of this.dividePlanes) {
            divideSpheres.push(inversionSphere.invertOnPlane(p));
        }

        let sphairahedron = CSG.sphere({
            center: [inversionSphere.center.x,
                     inversionSphere.center.y,
                     inversionSphere.center.z],
            radius: inversionSphere.r,
            resolution: 64
        });

        console.log('subtract');
        let progress = 1;
        for (const s of spheres) {
            console.log(` ${progress} / ${spheres.length}`);
            progress++;
            sphairahedron = sphairahedron.subtract(CSG.sphere({
                center: [s.center.x, s.center.y, s.center.z],
                radius: s.r,
                resolution: 64
            }));
        }

        for (const p of this.dividePlanes) {
            sphairahedron = sphairahedron.cutByPlane(CSG.Plane.fromNormalAndPoint(
                [p.normal.x, p.normal.y, p.normal.z],
                [p.p1.x, p.p1.y, p.p1.z]));
        }

        for (const s of divideSpheres) {
            console.log(` ${progress} / ${spheres.length}`);
            progress++;
            sphairahedron = sphairahedron.intersect(CSG.sphere({
                center: [s.center.x, s.center.y, s.center.z],
                radius: s.r,
                resolution: 64
            }));
        }
        return sphairahedron;
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
        if (this.constrainsInversionSphere) {
            this.computeInversionSphere();
        }
        this.computeGenSpheres();
        this.computeVertexes();
        this.computeDividePlanes();
        this.computeExcavationSpheres();
        this.computeSeedSpheres();
        this.computeConvexSphere();
        this.computeBoundingVolume();

        this.updated();
    }

    computeInversionSphere() {}

    computeSpheres() {}

    computeGenSpheres() {}

    computeVertexes() {
        this.vertexes = [];
        for (const vert of this.vertexIndexes) {
            this.vertexes.push(this.computeIdealVertex(this.gSpheres[vert[0]],
                                                       this.gSpheres[vert[1]],
                                                       this.gSpheres[vert[2]]));
        }
    }

    /**
     *
     * @param {Number} vertexIdx1
     * @param {Number} vertexIdx2
     * @param {Number} vertexIdx3
     * @returns {Plane}
     */
    computePlane(vertexIdx1, vertexIdx2, vertexIdx3) {
        const p1 = this.inversionSphere.invertOnPoint(this.vertexes[vertexIdx1]);
        const p2 = this.inversionSphere.invertOnPoint(this.vertexes[vertexIdx2]);
        const p3 = this.inversionSphere.invertOnPoint(this.vertexes[vertexIdx3]);

        const v1 = p2.sub(p1);
        const v2 = p3.sub(p1);
        let normal = Vec3.cross(v1, v2).normalize();
        if (normal.y < 0) {
            normal = normal.scale(-1);
        }
        return new Plane(p1, p2, p3, normal);
    }

    computeDividePlanes() {
        this.dividePlanes = [];
        this.dividePlanes.push(this.computePlane(0, 1, 2));
    }

    computeExcavationSpheres() {
        this.excavationPrismSpheres = [];
        this.excavationSpheres = [];
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

    computeConvexSphere() {
        this.convexSpheres = [];
        for (let i = 0; i < this.numDividePlanes; i++) {
            this.convexSpheres.push(this.inversionSphere.invertOnPlane(this.dividePlanes[i]));
        }
    }

    computeBoundingVolume () {
        this.boundingPlaneY = Number.MIN_VALUE;
        let boundingPlaneMinY = Number.MAX_VALUE;
        for (const s of this.prismSpheres) {
            this.boundingPlaneY = Math.max(this.boundingPlaneY, s.center.y)
            boundingPlaneMinY = Math.min(boundingPlaneMinY, s.center.y)
        }
        if (this.inversionSphere.center.y < boundingPlaneMinY) {
            this.boundingSphere = this.inversionSphere.invertOnPlane(new Plane(new Vec3(1, boundingPlaneMinY, -9),
                                                                               new Vec3(-4, boundingPlaneMinY, -4),
                                                                               new Vec3(10, boundingPlaneMinY, 3),
                                                                               new Vec3(0, 1, 0)));
        } else {
            this.boundingSphere = this.inversionSphere.invertOnPlane(new Plane(new Vec3(1, this.boundingPlaneY, -9),
                                                                               new Vec3(-4, this.boundingPlaneY, -4),
                                                                               new Vec3(10, this.boundingPlaneY, 3),
                                                                               new Vec3(0, 1, 0)));
        }
        this.boundingPlaneY += 1.01;
        this.boundingSphere.r *= 1.01;
        this.boundingSphere.update();
    }

    getUniformLocations(gl, program) {
        const uniLocations = [];

        uniLocations.push(gl.getUniformLocation(program, 'u_useFlashLight'));
        uniLocations.push(gl.getUniformLocation(program, 'u_enableSlice'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numSlicePlanes'));
        for (let i = 0; i < this.maxSlicePlanes; i++) {
            uniLocations.push(gl.getUniformLocation(program, `u_slicePlanes[${i}].origin`));
            uniLocations.push(gl.getUniformLocation(program, `u_slicePlanes[${i}].normal`));
        }
        uniLocations.push(gl.getUniformLocation(program, `u_quasiSphereSlicePlane.origin`));
        uniLocations.push(gl.getUniformLocation(program, `u_quasiSphereSlicePlane.normal`));

        uniLocations.push(gl.getUniformLocation(program, 'u_zbzc'));
        uniLocations.push(gl.getUniformLocation(program, 'u_ui'));

        uniLocations.push(gl.getUniformLocation(program, 'u_inversionSphere.center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_inversionSphere.r'));

        uniLocations.push(gl.getUniformLocation(program, 'u_twoDividePlanes'));

        for (let i = 0; i < this.numDividePlanes; i++) {
            uniLocations.push(gl.getUniformLocation(program, 'u_dividePlanes[' + i + '].origin'));
            uniLocations.push(gl.getUniformLocation(program, 'u_dividePlanes[' + i + '].normal'));

            uniLocations.push(gl.getUniformLocation(program, 'u_convexSpheres[' + i + '].center'));
            uniLocations.push(gl.getUniformLocation(program, 'u_convexSpheres[' + i + '].r'));
        }

        for (let i = 0; i < this.numExcavationSpheres; i++) {
            uniLocations.push(gl.getUniformLocation(program, 'u_excavationPrismSpheres[' + i + '].center'));
            uniLocations.push(gl.getUniformLocation(program, 'u_excavationPrismSpheres[' + i + '].r'));

            uniLocations.push(gl.getUniformLocation(program, 'u_excavationSpheres[' + i + '].center'));
            uniLocations.push(gl.getUniformLocation(program, 'u_excavationSpheres[' + i + '].r'));
        }

        uniLocations.push(gl.getUniformLocation(program, 'u_numPrismSpheres'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numPrismPlanes'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numSeedSpheres'));
        uniLocations.push(gl.getUniformLocation(program, 'u_numGenSpheres'));

        uniLocations.push(gl.getUniformLocation(program, 'u_boundingPlaneY'));
        uniLocations.push(gl.getUniformLocation(program, 'u_boundingSphere.center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_boundingSphere.r'));

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

        for (let i = 0; i < 12; i++) {
            uniLocations.push(gl.getUniformLocation(program, `u_boundingPlanes[${i}].origin`));
            uniLocations.push(gl.getUniformLocation(program, `u_boundingPlanes[${i}].normal`));
        }

        return uniLocations;
    }

    setUniformValues(gl, uniLocations, uniI, scale) {
        gl.uniform1i(uniLocations[uniI++], this.useFlashLight);
        gl.uniform1i(uniLocations[uniI++], this.enableSlice);
        gl.uniform1i(uniLocations[uniI++], this.slicePlanes[this.currentSliceIndex].length);
        for (let i = 0; i < this.maxSlicePlanes; i++) {
            if (i >= this.slicePlanes[this.currentSliceIndex].length) {
                uniI++;
                uniI++;
                continue;
            }
            gl.uniform3f(uniLocations[uniI++],
                         this.slicePlanes[this.currentSliceIndex][i].p1.x,
                         this.slicePlanes[this.currentSliceIndex][i].p1.y,
                         this.slicePlanes[this.currentSliceIndex][i].p1.z);
            gl.uniform3f(uniLocations[uniI++],
                         this.slicePlanes[this.currentSliceIndex][i].normal.x,
                         this.slicePlanes[this.currentSliceIndex][i].normal.y,
                         this.slicePlanes[this.currentSliceIndex][i].normal.z);
        }
        gl.uniform3f(uniLocations[uniI++],
                     this.quasiSphereSlicePlane.p1.x,
                     this.quasiSphereSlicePlane.p1.y,
                     this.quasiSphereSlicePlane.p1.z);
        if (this.quasiSphereSlicePlaneFlipNormal) {
            gl.uniform3f(uniLocations[uniI++],
                         this.quasiSphereSlicePlane.normal.x * -1,
                         this.quasiSphereSlicePlane.normal.y * -1,
                         this.quasiSphereSlicePlane.normal.z * -1);
        } else {
            gl.uniform3f(uniLocations[uniI++],
                         this.quasiSphereSlicePlane.normal.x,
                         this.quasiSphereSlicePlane.normal.y,
                         this.quasiSphereSlicePlane.normal.z);
        }
        gl.uniform2f(uniLocations[uniI++],
                     this.zb, this.zc);
        gl.uniform2f(uniLocations[uniI++],
                     this.pointRadius * scale, this.lineWidth * scale);

        gl.uniform3f(uniLocations[uniI++],
                     this.inversionSphere.center.x, this.inversionSphere.center.y, this.inversionSphere.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.inversionSphere.r, this.inversionSphere.rSq);

        gl.uniform1i(uniLocations[uniI++], this.twoDividePlanes);

        for (let i = 0; i < this.numDividePlanes; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.dividePlanes[i].p1.x, this.dividePlanes[i].p1.y, this.dividePlanes[i].p1.z);
            gl.uniform3f(uniLocations[uniI++],
                         this.dividePlanes[i].normal.x, this.dividePlanes[i].normal.y, this.dividePlanes[i].normal.z);
            gl.uniform3f(uniLocations[uniI++],
                         this.convexSpheres[i].center.x, this.convexSpheres[i].center.y, this.convexSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.convexSpheres[i].r, this.convexSpheres[i].rSq);
        }

        for (let i = 0; i < this.numExcavationSpheres; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.excavationPrismSpheres[i].center.x, this.excavationPrismSpheres[i].center.y, this.excavationPrismSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.excavationPrismSpheres[i].r, this.excavationPrismSpheres[i].rSq);

            gl.uniform3f(uniLocations[uniI++],
                         this.excavationSpheres[i].center.x, this.excavationSpheres[i].center.y, this.excavationSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.excavationSpheres[i].r, this.excavationSpheres[i].rSq);
        }

        gl.uniform1i(uniLocations[uniI++], this.numSpheres);
        gl.uniform1i(uniLocations[uniI++], this.numPlanes);
        gl.uniform1i(uniLocations[uniI++], this.numVertexes);
        gl.uniform1i(uniLocations[uniI++], this.numFaces);

        gl.uniform1f(uniLocations[uniI++], this.boundingPlaneY);
        gl.uniform3f(uniLocations[uniI++],
                     this.boundingSphere.center.x, this.boundingSphere.center.y, this.boundingSphere.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.boundingSphere.r, this.boundingSphere.rSq);

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

        for (let i = 0; i < this.boundingPlanes.length; i++) {
            gl.uniform3f(uniLocations[uniI++],
                         this.boundingPlanes[i].p1.x, this.boundingPlanes[i].p1.y, this.boundingPlanes[i].p1.z);
            gl.uniform3f(uniLocations[uniI++],
                         this.boundingPlanes[i].normal.x, this.boundingPlanes[i].normal.y, this.boundingPlanes[i].normal.z);
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
//                return;
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
        if (Vec2.distance(mouse, new Vec2(this.zb, this.zc)) < this.pointRadius * scale) {
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

    getShaderTemplateContext(shaderType) {
        return {
            'shaderType': shaderType,
            'numPrismSpheres': this.numSpheres,
            'numPrismPlanes': this.numPlanes,
            'numSpheirahedraSpheres': this.numFaces,
            'numSeedSpheres': this.numVertexes,
            'numDividePlanes': this.numDividePlanes,
            'numExcavationSpheres': this.numExcavationSpheres,
            'numBoundingPlanes': 12,
            'numSlicePlanes': this.slicePlanes[this.currentSliceIndex].length,
            'SHADER_TYPE_PRISM': Spheirahedra.SHADER_TYPE_PRISM,
            'SHADER_TYPE_SPHAIRAHEDRA': Spheirahedra.SHADER_TYPE_SPHAIRAHEDRA,
            'SHADER_TYPE_LIMITSET': Spheirahedra.SHADER_TYPE_LIMITSET,
            'SHADER_TYPE_PARAMETER': Spheirahedra.SHADER_TYPE_PARAMETER
        }
    }

    getParameterSpaceContext() {
        return {
            'conditions': []
        }
    }

    buildPrismShader() {
        return RENDER_PRISM_TMPL.render(
            this.getShaderTemplateContext(
                Spheirahedra.SHADER_TYPE_PRISM));
    }

    buildSpheirahedraShader() {
        return RENDER_SPHEIRAHEDRA_TMPL.render(
            this.getShaderTemplateContext(
                Spheirahedra.SHADER_TYPE_SPHAIRAHEDRA));
    }

    buildLimitsetShader(limitRenderingMode) {
        const context = this.getShaderTemplateContext(Spheirahedra.SHADER_TYPE_LIMITSET);
        context['renderMode'] = limitRenderingMode;
        return RENDER_LIMIT_SET_TMPL.render(context);
    }

    buildParameterSpaceShader() {
        return RENDER_PARAMETER_SPACE_TMPL.render(
            this.getParameterSpaceContext(
                Spheirahedra.SHADER_TYPE_PARAMETER));
    }

    static get SHADER_TYPE_PRISM() {
        return 0;
    }

    static get SHADER_TYPE_SPHAIRAHEDRA() {
        return 1;
    }

    static get SHADER_TYPE_LIMITSET() {
        return 2;
    }

    static get SHADER_TYPE_PARAMETER() {
        return 3;
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

    static get PRISM_PLANES_2222_SQUARE () {
        return [new Plane(new Vec3(0, 5, 1),
                          new Vec3(0.5, 1, 0.5),
                          new Vec3(1, 2, 0),
                          new Vec3(0.5, 0, 0.5).normalize()),
                new Plane(new Vec3(0, 5, 1),
                          new Vec3(-0.5, 1, 0.5),
                          new Vec3(-1, 2, 0),
                          new Vec3(-0.5, 0, 0.5).normalize()),
                new Plane(new Vec3(0, 5, -1),
                          new Vec3(-0.5, 1, -0.5),
                          new Vec3(-1, 2, 0),
                          new Vec3(-0.5, 0, -0.5).normalize()),
                new Plane(new Vec3(0, 3, -1),
                          new Vec3(0.5, 3, -0.5),
                          new Vec3(1, 2, 0),
                          new Vec3(0.5, 0, -0.5).normalize())];
    }

    static get SLICE_PLANES_FROM_333() {
        const s = Spheirahedra.PRISM_PLANES_333;
        let planes = [];
        const slices = [s];
        planes.push(s[0]);
        planes.push(s[1].invertOnPlane(planes[0]));
        planes.push(s[2].invertOnPlane(planes[0]));
        planes.push(s[1].invertOnPlane(planes[2]));
        planes.push(s[2].invertOnPlane(planes[1]));
        planes.push(s[1].invertOnPlane(planes[4]));

        slices.push(planes);
        planes = [];

        planes.push(s[1]);
        planes.push(s[2].invertOnPlane(planes[0]));
        planes.push(s[0].invertOnPlane(planes[0]));
        planes.push(s[2].invertOnPlane(planes[2]));
        planes.push(s[0].invertOnPlane(planes[1]));
        planes.push(s[2].invertOnPlane(planes[4]));

        slices.push(planes);
        planes = [];

        planes.push(s[2]);
        planes.push(s[0].invertOnPlane(planes[0]));
        planes.push(s[1].invertOnPlane(planes[0]));
        planes.push(s[0].invertOnPlane(planes[2]));
        planes.push(s[1].invertOnPlane(planes[1]));
        planes.push(s[0].invertOnPlane(planes[4]));

        slices.push(planes);
        return slices;
    }

    static get SLICE_PLANES_FROM_236() {
        const s = Spheirahedra.PRISM_PLANES_236;
        let planes = [];
        const slices = [s];
        planes.push(s[0]);
        planes.push(s[1].invertOnPlane(planes[0]));
        planes.push(s[2].invertOnPlane(planes[0]));
        planes.push(s[1].invertOnPlane(planes[2]));
        planes.push(s[2].invertOnPlane(planes[1]));
        planes.push(s[1].invertOnPlane(planes[4]));
        planes.push(s[2].invertOnPlane(planes[3]));
        planes.push(s[1].invertOnPlane(planes[6]));
        planes.push(s[2].invertOnPlane(planes[5]));
        planes.push(s[1].invertOnPlane(planes[8]));
        planes.push(s[2].invertOnPlane(planes[7]));
        slices.push(planes);
        planes = [];

        planes.push(s[1]);
        planes.push(s[2].invertOnPlane(planes[0]));
        planes.push(s[0].invertOnPlane(planes[0]));
        planes.push(s[2].invertOnPlane(planes[2]));
        planes.push(s[0].invertOnPlane(planes[1]));
        planes.push(s[2].invertOnPlane(planes[4]));
        planes.push(s[0].invertOnPlane(planes[3]));
        planes.push(s[2].invertOnPlane(planes[6]));
        planes.push(s[0].invertOnPlane(planes[5]));
        slices.push(planes);
        planes = [];

        planes.push(s[2]);
        planes.push(s[0].invertOnPlane(planes[0]));
        planes.push(s[1].invertOnPlane(planes[0]));
        planes.push(s[0].invertOnPlane(planes[2]));
        planes.push(s[1].invertOnPlane(planes[1]));
        planes.push(s[0].invertOnPlane(planes[4]));
        planes.push(s[1].invertOnPlane(planes[3]));
        planes.push(s[0].invertOnPlane(planes[6]));
        planes.push(s[1].invertOnPlane(planes[5]));

        slices.push(planes);
        return slices;
    }

    static get SLICE_PLANES_FROM_244() {
        const s = Spheirahedra.PRISM_PLANES_244;
        let planes = [];
        const slices = [s];
        planes.push(s[0]);
        planes.push(s[1].invertOnPlane(planes[0]));
        planes.push(s[2].invertOnPlane(planes[0]));
        planes.push(s[1].invertOnPlane(planes[2]));
        planes.push(s[2].invertOnPlane(planes[1]));
        planes.push(s[1].invertOnPlane(planes[4]));
        planes.push(s[2].invertOnPlane(planes[3]));
        slices.push(planes);
        planes = [];

        planes.push(s[1]);
        planes.push(s[2].invertOnPlane(planes[0]));
        planes.push(s[0].invertOnPlane(planes[0]));
        planes.push(s[2].invertOnPlane(planes[2]));
        planes.push(s[0].invertOnPlane(planes[1]));
        planes.push(s[2].invertOnPlane(planes[4]));

        slices.push(planes);
        planes = [];

        planes.push(s[2]);
        planes.push(s[0].invertOnPlane(planes[0]));
        planes.push(s[1].invertOnPlane(planes[0]));
        planes.push(s[0].invertOnPlane(planes[2]));
        planes.push(s[1].invertOnPlane(planes[1]));
        planes.push(s[0].invertOnPlane(planes[4]));

        slices.push(planes);
        return slices;
    }

    static get SLICE_PLANES_FROM_2222_SQUARE() {
        const s = Spheirahedra.PRISM_PLANES_2222_SQUARE;
        let planes = [];
        const slices = [Spheirahedra.PRISM_PLANES_2222_SQUARE,
                        Spheirahedra.PRISM_PLANES_2222_SQUARE,
                        Spheirahedra.PRISM_PLANES_2222_SQUARE,
                        Spheirahedra.PRISM_PLANES_2222_SQUARE];
        
        return slices;
    }
}
