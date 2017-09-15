import Spheirahedra from '../spheirahedra.js';
import Cake from './hexahedralCake2.js';
import Plane from '../plane.js';
import Sphere from '../sphere.js';
import Vec3 from '../vector3d.js';

const RT_2 = Math.sqrt(2);
const RT_3 = Math.sqrt(3);
const RT_6 = Math.sqrt(6);
const SIN_PI_12 = (RT_6 - RT_2) * 0.25;
const COS_PI_12 = (RT_6 + RT_2) * 0.25;
const COS_5_PI_12 = SIN_PI_12;
const SIN_5_PI_12 = COS_PI_12;

class CakeA extends Cake {
    constructor(tb) {
        super(tb);
        this.planes = Spheirahedra.PRISM_PLANES_2222_SQUARE;
    }

    computeSpheres() {
        const r5 = (2 + this.zb * this.zb) / (4 * RT_2);
        const r6 = RT_6 * (2 + this.zb * this.zb) / 8;
        const s5 = new Sphere(-r5 * SIN_PI_12, this.zb, 1 - r5 * COS_PI_12, r5);

        const dx = (1 - r6 / RT_2);
        const dy = -r6 / RT_2;
        const s6 = new Sphere(dx - r6 * COS_5_PI_12, 0, dy + r6 * SIN_5_PI_12,
                              r6);
        this.prismSpheres = [s5, s6];
        const cx = -r6 / RT_2;
        const cy = 1 - r6 / RT_2;
        this.planes[2] = new Plane(new Vec3(cx, 4, cy),
                                   new Vec3((cx + dx) * 0.5, 6, (cy + dy) * 0.5),
                                   new Vec3(dx, -3, dy),
                                   this.planes[2].normal);
        this.inversionSphere = new Sphere(s5.center.x, s5.center.y + 1.2, s5.center.z,
                                          0.5);
    }
}

class CakeB extends Cake {
    constructor(tb) {
        super(tb);
        this.planes = Spheirahedra.PRISM_PLANES_2222_SQUARE;
    }

    computeSpheres() {
        const r5 = (2 + this.zb * this.zb) * 0.25;
        const r6 = r5;
        const adSinPi4 = (2 + this.zb * this.zb) * 0.25;
        const s5 = new Sphere(0, this.zb, 1 - adSinPi4, r5);
        const s6 = new Sphere(1 - adSinPi4, 0, 0, r6);

        this.prismSpheres = [s5, s6];
        const cx = -adSinPi4;
        const cy = 1 - adSinPi4;
        const dx = cy;
        const dy = cx;
        this.planes[2] = new Plane(new Vec3(cx, 4, cy),
                                   new Vec3((cx + dx) * 0.5, 6, (cy + dy) * 0.5),
                                   new Vec3(dx, -2, dy),
                                   this.planes[2].normal);
        this.inversionSphere = new Sphere(s5.center.x, s5.center.y + 1.5, s5.center.z,
                                          0.8);
    }
}

class CakeC extends Cake {
    constructor(tb) {
        super(tb);
        this.planes = Spheirahedra.PRISM_PLANES_2222_SQUARE;
    }

    computeSpheres() {
        const r5 = (2 + this.zb * this.zb) / (2 * RT_6);
        const r6 = r5;
        const s5 = new Sphere(r5 * SIN_PI_12, this.zb, 1 - r5 * COS_PI_12, r5);

        const dx = (1 - r5 / RT_2);
        const dy = -r5 / RT_2;
        const s6 = new Sphere(dx - r6 * COS_5_PI_12, 0, dy + r6 * SIN_5_PI_12,
                              r6);
        this.prismSpheres = [s5, s6];
        const cx = -r6 / RT_2;
        const cy = 1 - r6 / RT_2;
        this.planes[2] = new Plane(new Vec3(cx, 4, cy),
                                   new Vec3((cx + dx) * 0.5, 6, (cy + dy) * 0.5),
                                   new Vec3(dx, -3, dy),
                                   this.planes[2].normal);
        this.inversionSphere = new Sphere(s5.center.x, s5.center.y + 1.2, s5.center.z,
                                          0.5);
    }
}

export default [CakeA, CakeB, CakeC];
