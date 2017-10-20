import Spheirahedra from '../spheirahedra.js';

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
        if(this.prismSpheres[0].center.y > this.prismSpheres[1].center.y) {
            this.dividePlanes.push(this.computePlane(0, 1, 2));
            this.dividePlanes.push(this.computePlane(3, 4, 5));
        } else {
            this.dividePlanes.push(this.computePlane(0, 4, 5));
            this.dividePlanes.push(this.computePlane(0, 4, 5));
        }
    }
}
