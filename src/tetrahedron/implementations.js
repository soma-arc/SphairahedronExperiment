import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';
import Tetrahedron from './spheirahedraTetrahedron.js';

class TetrahedronA extends Tetrahedron {
    constructor() {
        super(0, 0);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }
}

class TetrahedronB extends Tetrahedron {
    constructor() {
        super(0, 0);
        this.planes = Spheirahedra.PRISM_PLANES_236;
        this.slicePlanes = Spheirahedra.SLICE_PLANES_FROM_236;
    }
}

class TetrahedronC extends Tetrahedron {
    constructor() {
        super(0, 0);
        this.planes = Spheirahedra.PRISM_PLANES_244;
        this.slicePlanes = Spheirahedra.SLICE_PLANES_FROM_244;
    }
}

export default [TetrahedronA, TetrahedronB, TetrahedronC];
