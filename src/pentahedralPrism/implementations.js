import Spheirahedra from '../spheirahedra.js';
import Prism from './pentahedralPrism.js';
import Sphere from '../sphere.js';

const RT_3 = Math.sqrt(3);
const RT_2 = Math.sqrt(2);

class PrismA extends Prism {
    constructor(tb) {
        super(tb, 0);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r4 = 1;
        const r2 = (this.zb * this.zb) / 3;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(0, this.zb, 0, r4);
        this.prismSpheres = [s2, s4];
    }
}

class PrismB extends Prism {
    constructor(tb) {
        super(tb, 0);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r4 = RT_3 * 0.5;
        const r2 = (3 + 2 * this.zb * this.zb) / 6;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(-0.5, this.zb, 0, r4);
        this.prismSpheres = [s2, s4];
    }
}

class PrismC extends Prism {
    constructor(tb) {
        super(tb, 0);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r4 = RT_3;
        const r2 = (this.zb * this.zb - 3) / 3;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(1, this.zb, 0, r4);
        this.prismSpheres = [s2, s4];
    }
}

class PrismD extends Prism {
    constructor(tb) {
        super(tb, 0);
        this.planes = Spheirahedra.PRISM_PLANES_236;
    }

    computeSpheres() {
        const r4 = 1;
        const r2 = (this.zb * this.zb) / RT_3;
        const s2 = new Sphere(1 - r2 * RT_3 * 0.5, 0, r2 * 0.5, r2);
        const s4 = new Sphere(0, this.zb, 0, r4);
        this.prismSpheres = [s2, s4];
    }
}

class PrismE extends Prism {
    constructor(tb) {
        super(tb, 0);
        this.planes = Spheirahedra.PRISM_PLANES_244;
    }

    computeSpheres() {
        const r4 = RT_2;
        const r2 = (this.zb * this.zb - 2) / 2;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(1, this.zb, 0, r4);
        this.prismSpheres = [s2, s4];
    }
}

class PrismF extends Prism {
    constructor(tb) {
        super(tb, 0);
        this.planes = Spheirahedra.PRISM_PLANES_244;
    }

    computeSpheres() {
        const r4 = 1;
        const r2 = (this.zb * this.zb) / 2;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(0, this.zb, 0, r4);
        this.prismSpheres = [s2, s4];
    }
}

export default [PrismA, PrismB, PrismC, PrismD,
                PrismE, PrismF];
