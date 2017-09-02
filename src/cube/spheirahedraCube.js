import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';

export default class SpheirahedraCube extends Spheirahedra {
    constructor(tb, tc) {
        super(tb, tc);

        this.numFaces = 6;
        this.numSpheres = 3;
        this.numPlanes = 3;
        this.vertexIndexes = [[0, 1, 2], [0, 3, 4], [2, 4, 5], [0, 1, 3],
                              [3, 4, 5], [1, 2, 5], [1, 3, 5], [0, 2, 4]];
        this.numVertexes = this.vertexIndexes.length;
    }

    computeGenSpheres() {
        this.gSpheres = new Array(6);
        this.gSpheres[0] = this.inversionSphere.invertOnPlane(this.planes[0]);
        this.gSpheres[1] = this.inversionSphere.invertOnSphere(this.s2);
        this.gSpheres[2] = this.inversionSphere.invertOnPlane(this.planes[1]);
        this.gSpheres[3] = this.inversionSphere.invertOnSphere(this.s4);
        this.gSpheres[4] = this.inversionSphere.invertOnPlane(this.planes[2]);
        this.gSpheres[5] = this.inversionSphere.invertOnSphere(this.s6);
    }

    computeConvexSphere() {
        this.convexSphere = Sphere.fromPoints(this.vertexes[0],
                                              this.vertexes[2],
                                              this.vertexes[4],
                                              this.vertexes[6]);
    }
}
