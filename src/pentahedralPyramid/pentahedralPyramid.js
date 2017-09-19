import Spheirahedra from '../spheirahedra.js';
import Sphere from '../sphere.js';

export default class PentahedralPyramid extends Spheirahedra {
    constructor(tb, tc) {
        super(tb, tc);

        this.numFaces = 5;
        this.numSpheres = 1;
        this.numPlanes = 4;
        this.vertexIndexes = [[0, 1, 4], [0, 3, 4], [1, 2, 4],
                              [2, 3, 4], [0, 1, 2]];
        this.numVertexes = this.vertexIndexes.length;

        this.inversionSphere = new Sphere(0.5, 3, 0, 1.3);
    }

    computeGenSpheres() {
        this.gSpheres = new Array(5);
        this.gSpheres[0] = this.inversionSphere.invertOnPlane(this.planes[0]);
        this.gSpheres[1] = this.inversionSphere.invertOnPlane(this.planes[1]);
        this.gSpheres[2] = this.inversionSphere.invertOnPlane(this.planes[2]);
        this.gSpheres[3] = this.inversionSphere.invertOnPlane(this.planes[3]);
        this.gSpheres[4] = this.inversionSphere.invertOnSphere(this.prismSpheres[0]);
    }

    computeConvexSphere() {
        this.convexSphere = Sphere.fromPoints(this.vertexes[0],
                                              this.vertexes[1],
                                              this.vertexes[2],
                                              this.vertexes[4]);
    }
}
