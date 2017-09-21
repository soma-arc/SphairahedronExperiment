import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';

export default class HexahedralCake2 extends Spheirahedra {
    constructor(tb) {
        super(tb, 0);

        this.numFaces = 6;
        this.numSpheres = 2;
        this.numPlanes = 4;

        this.vertexIndexes = [[0, 3, 5], [0, 1, 4], [1, 2, 4], [2, 3, 5],
                              [1, 4, 5], [2, 4, 5], [0, 1, 2]];
        this.numVertexes = this.vertexIndexes.length;
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
}
