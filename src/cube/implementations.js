import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';
import SpheirahedraCube from './spheirahedraCube.js';

const SQRT_3 = Math.sqrt(3);
const SQRT_2 = Math.sqrt(2);

class CubeA extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = 0.5 + (this.zb * this.zc) / 3.0;
        const r4 = 0.5 + (this.zb * this.zb - this.zb * this.zc) / 3.0;
        const r6 = 0.5 + (-this.zb * this.zc + this.zc * this.zc) / 3.0;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(-(1 - r4) * 0.5, this.zb, Math.sqrt(3) * (1 - r4) * 0.5, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -Math.sqrt(3) * (1 - r6) * 0.5, r6);

        this.inversionSphere = new Sphere(-s6.center.x,
                                          -s6.center.y,
                                          s6.center.z,
                                          s6.r);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CubeB extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = (3 * SQRT_3 + 2 * SQRT_3 * this.zb * this.zc) / 9.0;
        const r4 = (3 * this.zb * this.zb - 4 * this.zb * this.zc + 3) / 9.0;
        const r6 = (3 * this.zc * this.zc - 2 * this.zb * this.zc + 6) / 9.0;
        const s2 = new Sphere((2 - SQRT_3 * r2) * 0.5, 0, r2 * 0.5, r2);
        const s4 = new Sphere(-(1 - r4) * 0.5, this.zb, SQRT_3 * (1 - r4) * 0.5, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);
        this.inversionSphere = new Sphere(-s2.center.x,
                                          -s4.center.y + 3,
                                          s4.center.z,
                                          s6.r);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CubeC extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = (this.zb * this.zb + 2 * this.zb * this.zc + 6) / (5 * SQRT_3);
        const r4 = (3 * this.zb * this.zb - 4 * this.zb * this.zc + 3) / (5 * SQRT_3);
        const r6 = (-this.zb * this.zb - 2 * this.zb * this.zc + 5 * this.zc * this.zc + 9) / 15.0;
        const s2 = new Sphere((2 - SQRT_3 * r2) * 0.5, 0, r2 * 0.5, r2);
        const s4 = new Sphere(-0.5, this.zb, SQRT_3 / 2 - r4, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);

        this.inversionSphere = new Sphere(-s2.center.x,
                                          -s4.center.y + 3,
                                          s4.center.z,
                                          s6.r);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CubeD extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_236;
    }

    computeSpheres() {
        const r2 = (3 * this.zb * this.zb + this.zc * this.zc + 6 * this.zb * this.zc + 6) / 18;
        const r4 = (15 * this.zb * this.zb - this.zc * this.zc - 6 * this.zb * this.zc + 12) / (18 * SQRT_3);
        const r6 = (-3 * this.zb * this.zb + 5 * this.zc * this.zc - 6 * this.zb * this.zc + 12) / 18.0;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(0.5, this.zb, SQRT_3 / 2 - r4, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);

        this.inversionSphere = new Sphere(s2.center.x,
                                          -s2.center.y + 3,
                                          s2.center.z,
                                          s6.r);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CubeE extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_236;
    }

    computeSpheres() {
        const r2 = (this.zc * this.zc + 6 * this.zb * this.zc + 3) / (7 * SQRT_3);
        const r4 = (7 * this.zb * this.zb - this.zc * this.zc - 6 * this.zb * this.zc + 4) / (14);
        const r6 = (2 * this.zc * this.zc - 2 * this.zb * this.zc + 6) / 7.0;
        const s2 = new Sphere(1 - SQRT_3 * 0.5 * r2, 0, r2 * 0.5, r2);
        const s4 = new Sphere((1 + r4) * 0.5, this.zb, (1 - r4) * SQRT_3 * 0.5, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -(1 - r6) * SQRT_3 * 0.5, r6);

        this.inversionSphere = new Sphere(s2.center.x,
                                          s2.center.y + 2,
                                          s2.center.z,
                                          s6.r);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CubeH extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_244;
    }

    computeSpheres() {
        const r2 = (this.zc * this.zc + 2 * this.zb * this.zc + 2) / 6;
        const r4 = (-this.zc * this.zc + 3 * this.zb * this.zb - 2 * this.zb * this.zc + 4) / (6 * SQRT_2);
        const r6 = (this.zc * this.zc - this.zb * this.zc + 2) / 3.0;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(r4 / SQRT_2, this.zb, 1 - r4 / SQRT_2, r4);
        const s6 = new Sphere(0, this.zc, -1 + r6, r6);

        this.inversionSphere = new Sphere(s2.center.x,
                                          s4.center.y + 1,
                                          s2.center.z,
                                          s2.r);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CubeI extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_244;
    }

    computeSpheres() {
        const r2 = (this.zb * this.zc) / 2;
        const r4 = (this.zb * this.zb - this.zb * this.zc + 2) / (2 * SQRT_2);
        const r6 = (this.zc * this.zc - this.zb * this.zc + 2) / (2 * SQRT_2);
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(r4 / SQRT_2, this.zb, 1 - r4 / SQRT_2, r4);
        const s6 = new Sphere(r6 / SQRT_2, this.zc, r6 / SQRT_2 - 1, r6);

        this.inversionSphere = new Sphere(s2.center.x,
                                          s6.center.y + 1.5,
                                          s2.center.z,
                                          0.3);
        this.prismSpheres = [s2, s4, s6];
    }
}

export default [CubeA, CubeB, CubeC, CubeD, CubeE,
                CubeH, CubeI];
