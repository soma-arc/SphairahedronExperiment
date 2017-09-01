import Vec3 from '../vector3d.js';
import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';
import SpheirahedraCube from './spheirahedraCube.js';

export default class SpheirahedraCubeA extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        // (3, 3, 3) AB
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = 0.5 + (this.zb * this.zc) / 3.0;
        const r4 = 0.5 + (this.zb * this.zb - this.zb * this.zc) / 3.0;
        const r6 = 0.5 + (-this.zb * this.zc + this.zc * this.zc) / 3.0;
        this.s2 = new Sphere(1 - r2, 0, 0, r2);
        this.s4 = new Sphere(-(1 - r4) * 0.5, this.zb, Math.sqrt(3) * (1 - r4) * 0.5, r4);
        this.s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -Math.sqrt(3) * (1 - r6) * 0.5, r6);

        this.inversionSphere = new Sphere(-this.s6.center.x,
                                          -this.s6.center.y,
                                          this.s6.center.z,
                                          this.s6.r);
    }
}
