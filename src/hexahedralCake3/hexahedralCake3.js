import Spheirahedra from '../spheirahedra.js';
import Plane from '../plane.js';
import Vec3 from '../vector3d.js';

export default class HexahedralCake3 extends Spheirahedra {
    constructor(tb) {
        super(tb, 0);

        this.numFaces = 6;
        this.numSpheres = 2;
        this.numPlanes = 4;

        this.vertexIndexes = [[0, 3, 4], [0, 1, 4], [1, 2, 4], [2, 3, 5],
                              [3, 4, 5], [2, 4, 5], [0, 1, 2]];
        this.numVertexes = this.vertexIndexes.length;
        this.numDividePlanes = 2;
        this.twoDividePlanes = true;

        this.numSlicePlanes = 4;
        this.slicePlanes = Spheirahedra.SLICE_PLANES_FROM_2222_SQUARE;
    }

    computeGenSpheres() {
        this.gSpheres = new Array(5);
        this.gSpheres[0] = this.inversionSphere.invertOnPlane(this.planes[0]);
        this.gSpheres[1] = this.inversionSphere.invertOnPlane(this.planes[1]);
        this.gSpheres[2] = this.inversionSphere.invertOnPlane(this.planes[2]);
        this.gSpheres[3] = this.inversionSphere.invertOnPlane(this.planes[3]);
        this.gSpheres[4] = this.inversionSphere.invertOnSphere(this.prismSpheres[0]);
        this.gSpheres[5] = this.inversionSphere.invertOnSphere(this.prismSpheres[1]);
    }

    computeDividePlanes() {
        this.dividePlanes = [];
        if (this.prismSpheres[0].center.y > this.prismSpheres[1].center.y) {
            this.dividePlanes.push(this.computePlane(0, 1, 2));
            this.dividePlanes.push(this.computePlane(3, 4, 5));
        } else {
            this.dividePlanes.push(this.computePlane(0, 4, 5));
            this.dividePlanes.push(this.computePlane(0, 4, 5));
        }
    }

    computeConvexSphere() {
        this.convexSpheres = [];
        this.convexSpheres.push(this.inversionSphere.invertOnPlane(this.dividePlanes[0]));
        this.convexSpheres.push(this.inversionSphere.invertOnPlane(new Plane(new Vec3(1, 0, 2),
                                                                             new Vec3(-3, 0, 1),
                                                                             new Vec3(-1, 0, -3),
                                                                             new Vec3(0, 1, 0))));
    }
}
