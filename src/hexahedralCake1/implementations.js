import Spheirahedra from '../spheirahedra.js';
import Cake from './hexahedralCake1.js';
import Sphere from '../sphere.js';
import { SIN_TABLE, COS_TABLE } from '../constants.js';

const SQRT_3 = Math.sqrt(3);
const SIN_PI_3 = SQRT_3 * 0.5;

class CakeA extends Cake {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
//        console.log(this.zc);
        const r6 = 1;
        const r2 = (this.zb * this.zb) / 3;
        const r6d = r6 * SIN_PI_3;
        const r2d = r2 * SIN_PI_3;

        // const z4 = this.zc;
        // const r4d = this.computeR4(r2d, r6d, z4, this.zb, SQRT_3);
        // const r4 = r4d / SIN_PI_3;

        const r4 = this.zc;
        const r4d = r4 * SIN_PI_3;
        const z4 = this.computeZ4(r2d, r4d, r6d, this.zb, SQRT_3);
        const cosTheta = Math.sqrt((r2d + r4d) * (r2d + r4d) - z4 * z4) / (r2d + r4d);
        const l = r2d + r2d * cosTheta;
//        console.log(r4);
        const px = 1 - SIN_PI_3 * l;
        const py = l * 0.5;

        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(px - r4, z4, py, r4);
        const s6 = new Sphere(0, this.zb, 0, r6);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CakeB extends Cake {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r6 = SIN_PI_3;
        const r2 = (3 + 2 * this.zb * this.zb) / 6;
        const r6d = r6 * 0.5;
        const r2d = r2 * SIN_PI_3;
        const r4 = this.zc;
        const r4d = r4;
        const z4 = this.computeZ4(r2d, r4d, r6d, this.zb, SQRT_3);

        const l = r2d + Math.sqrt((r2d + r4d) * (r2d + r4d) - z4 * z4);

        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(1 - SIN_PI_3 * (l), z4, 0.5 * (l), r4);
        const s6 = new Sphere(-0.5, this.zb, 0, r6);
        this.prismSpheres = [s2, s4, s6];
    }
}

class CakeC extends Cake {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;

        this.r6 = this.computeR6(SQRT_3, 6);
        this.r6d = this.r6 * SIN_TABLE[2];
    }

    computeSpheres() {
        console.log(this.r6d);
        const r2 = this.computeR2(SQRT_3, this.r6, 2, 3);
        const r2d = r2 * SIN_TABLE[3];
        const r4 = this.zc;
        const r4d = r4 * SIN_TABLE[6];
        const z4 = this.computeZ4(r2d, r4d, this.r6d, this.zb, SQRT_3);
        const cosTheta = Math.sqrt((r2d + r4d) * (r2d + r4d) - z4 * z4) / (r2d + r4d);
        const l = r2d + r2d * cosTheta;

        const px = 1 - l * COS_TABLE[6];
        const py = l * SIN_TABLE[6];

        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(px - COS_TABLE[6] * r4, z4, py - SIN_TABLE[6] * r4, r4);
        const s6 = new Sphere(1, this.zb, 0, this.r6);
        this.prismSpheres = [s2, s4, s6];
    }
}

export default [CakeA, CakeB, CakeC];
