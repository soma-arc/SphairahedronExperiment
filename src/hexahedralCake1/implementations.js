import Spheirahedra from '../spheirahedra.js';
import Cake from './hexahedralCake1.js';
import Sphere from '../sphere.js';

const SQRT_3 = Math.sqrt(3);
const SIN_PI_3 = SQRT_3 * 0.5;

// class CakeA extends Cake {
//     constructor(tb, tc) {
//         super(tb, tc);
//         this.planes = Spheirahedra.PRISM_PLANES_333;
//     }

//     computeSpheres() {
// //        console.log(this.zc);
//         const r6 = 1;
//         const r2 = (this.zb * this.zb) / 3;
//         const r6d = r6 * SIN_PI_3;
//         const r2d = r2 * SIN_PI_3;
//         const r4d = this.computeR4(r2d, r6d, this.zc, this.zb, SQRT_3);
//         const r4 = r4d / SIN_PI_3;
//         const cosTheta = Math.sqrt((r4d + r6d) * (r4d + r6d) - (this.zb - this.zc) * (this.zb - this.zc)) / (r4d + r6d);
//         const l = r2d + r2d * cosTheta;
// //        console.log(r4);
//         const px = 1 - SIN_PI_3 * l;
//         const py = l * 0.5;

//         const s2 = new Sphere(1 - r2, 0, 0, r2);
//         const s4 = new Sphere(px - SIN_PI_3 * r4, this.zc, py + 0.5 * r4, r4);
//         const s6 = new Sphere(0, this.zb, 0, r6);
//         this.prismSpheres = [s2, s4, s6];
//     }
// }

class CakeA extends Cake {
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
//        const cosT = Math.sqrt((r2d + r4d) * (r2d + r4d) - (this.zb - z4) * (this.zb - z4)) / (r4d + r6d);
        const l = r2d + Math.sqrt((r2d + r4d) * (r2d + r4d) - z4 * z4);

        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(1 - SIN_PI_3 * (l), z4, 0.5 * (l), r4);
        const s6 = new Sphere(-0.5, this.zb, 0, r6);
        this.prismSpheres = [s2, s4, s6];
    }
}

export default [CakeA];
