import Spheirahedra from '../spheirahedra.js';
import Pyramid from './pentahedralPyramid.js';
import Vec3 from '../vector3d.js';
import Plane from '../plane.js';
import Sphere from '../sphere.js';

const RT_2 = Math.sqrt(2);
const RT_3 = Math.sqrt(3);

class PyramidA extends Pyramid {
    constructor() {
        super(0, 0);
        this.planes = [new Plane(new Vec3(0, 5, 1),
                                 new Vec3(0.5, 1, 0.5),
                                 new Vec3(1, 2, 0),
                                 new Vec3(0.5, 0, 0.5).normalize()),
                       new Plane(new Vec3(1 - RT_3, 5, RT_3),
                                 new Vec3((1 - 2 * RT_3) * 0.5, 1, (2 * RT_3 - 1) * 0.5),
                                 new Vec3(-RT_3, 2, RT_3 - 1),
                                 new Vec3(-0.5, 0, 0.5).normalize()),
                       new Plane(new Vec3(0, 5, -1),
                                 new Vec3(-0.5, 1, -0.5),
                                 new Vec3(-1, 2, 0),
                                 new Vec3(-0.5, 0, -0.5).normalize()),
                       new Plane(new Vec3(0, 3, -1),
                                 new Vec3(0.5, 3, -0.5),
                                 new Vec3(1, 2, 0),
                                 new Vec3(0.5, 0, -0.5).normalize())];
        this.prismSpheres = [new Sphere(1 - (RT_3 + 1) * 0.5,
                                        0,
                                        (RT_3 - 1) * 0.5,
                                        RT_2)];
    }
}

class PyramidB extends Pyramid {
    constructor() {
        super(0, 0);
        this.planes = Spheirahedra.PRISM_PLANES_2222_SQUARE;
        this.prismSpheres = [new Sphere(0, 0, 0, 1)]
    }
}

export default [PyramidA, PyramidB];
