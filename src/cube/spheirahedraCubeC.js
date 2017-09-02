import Vec3 from '../vector3d.js';
import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';
import SpheirahedraCube from './spheirahedraCube.js';

const SQRT_3 = Math.sqrt(3);

export default class SpheirahedraCubeC extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        // (3, 3, 3) AB
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = (this.zb * this.zb + 2 * this.zb * this.zc + 6) / (5 * SQRT_3);
        const r4 = (3 * this.zb * this.zb - 4 * this.zb * this.zc + 3) / (5 * SQRT_3);
        const r6 = (-this.zb * this.zb - 2 * this.zb * this.zc + 5 * this.zc * this.zc + 9) / 15.0;
        this.s2 = new Sphere((2 - SQRT_3 * r2) * 0.5, 0, r2 * 0.5, r2);
        this.s4 = new Sphere(-0.5, this.zb, SQRT_3 / 2 - r4, r4);
        this.s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);

        this.inversionSphere = new Sphere(-this.s2.center.x,
                                          -this.s4.center.y + 3,
                                          this.s4.center.z,
                                          this.s6.r);
    }
}
