import Spheirahedra from '../spheirahedra.js';
import Sphere from '../sphere.js';
import { SIN_TABLE } from '../constants.js';

export default class HexahedralCake1 extends Spheirahedra {
    constructor(tb, tc) {
        super(tb, tc);
        this.numFaces = 6;
        this.numSpheres = 3;
        this.numPlanes = 3;

        this.vertexIndexes = [[0, 1, 2], [0, 1, 3], [0, 3, 5],
                              [0, 4, 5], [1, 3, 5], [1, 2, 5],
                              [2, 4, 5], [0, 2, 4]];
        this.numVertexes = this.vertexIndexes.length;

        this.inversionSphere = new Sphere(0, 3, 0,
                                          0.8);

        this.numDividePlanes = 1;
        this.numExcavationSpheres = 1;
    }

    computeR6(bc, theta56Denom) {
        return bc / (2 * SIN_TABLE[theta56Denom]);
    }

    computeR2(ac, r6, theta36Denom, theta23Denom) {
        return (ac * ac + this.zb * this.zb - 2 * r6 * ac * SIN_TABLE[theta36Denom]) / (2 * ac * SIN_TABLE[theta23Denom]);
    }

    computeDividePlanes() {
        this.dividePlanes = [];
        this.dividePlanes.push(this.computePlane(0, 3, 6));
        this.dividePlanes.push(this.computePlane(1, 2, 4));
    }

    computeExcavationSpheres() {
        this.excavationPrismSpheres = [];
        this.excavationPrismSpheres.push(
            Sphere.fromPoints(this.inversionSphere.invertOnPoint(this.vertexes[1]),
                              this.inversionSphere.invertOnPoint(this.vertexes[2]),
                              this.inversionSphere.invertOnPoint(this.vertexes[4]),
                              this.inversionSphere.invertOnPoint(this.computeIdealVertex(this.gSpheres[3],
                                                                                         this.gSpheres[1],
                                                                                         this.gSpheres[5]))));

        this.excavationSpheres = [];
        for (const s of this.excavationPrismSpheres) {
            this.excavationSpheres.push(this.inversionSphere.invertOnSphere(s));
        }
    }

    computeGenSpheres() {
        this.gSpheres = new Array(6);
        this.gSpheres[0] = this.inversionSphere.invertOnPlane(this.planes[0]); // O1
        this.gSpheres[1] = this.inversionSphere.invertOnSphere(this.prismSpheres[0]); // O2
        this.gSpheres[2] = this.inversionSphere.invertOnPlane(this.planes[1]); // O3
        this.gSpheres[3] = this.inversionSphere.invertOnSphere(this.prismSpheres[1]); // O4
        this.gSpheres[4] = this.inversionSphere.invertOnPlane(this.planes[2]); // O5
        this.gSpheres[5] = this.inversionSphere.invertOnSphere(this.prismSpheres[2]); // O6
    }

    /**
     *
     * @param {number} r2
     * @param {Number} r6
     * @param {Number} z4
     * @param {Number} zb
     * @param {Number} ac
     * @returns {Number}
     */
    computeR4(r2, r6, z4, zb, ac) {
        const A = (ac - 2 * r2);
        const B = (ac - 2 * r6);
        const C = (-ac + r2 + r6);
        const C2 = C * C;
        const D = (-2 * z4 + zb);
        const D2 = D * D;
        const AB = A * B;

        // return (-AB * (r2 + r6) + 2 * (-r2 + r6) * z4 * zb + (r2 - r6) * zb * zb +
        //         Math.sqrt(C2 * (AB + zb * zb) * (AB + D2))) / (2 * AB);

        return -(AB * (r2 + r6) + 2 * (r2 - r6) * z4 * zb + (-r2 + r6) * zb * zb +
                 Math.sqrt(C2 * (AB + zb * zb) * (AB + D2))) / (2 * AB);
    }

    /**
     *
     * @param {number} r2
     * @param {Number} r4
     * @param {Number} r6
     * @param {Number} zb
     * @param {Number} ac
     * @returns {Number}
     */
    computeZ4(r2, r4, r6, zb, ac) {
        const A = (ac - 2 * r2);
        const B = (ac - 2 * r6);
        const AB = A * B;

        const zb2 = zb * zb;
        const D = -ac + r2 + r6;
        const D2 = D * D;

        // return (zb * (ac * ac + 2 * r2 * (r2 + r4) + 2 * r6 * (r2 - r4) - 2 * ac * (r2 + r6) + zb2) +
        //         Math.sqrt(-D2 * (AB + zb2) * ((ac + 2 * r4) * (ac - 2 * (r2 + r4 + r6)) + zb2))) / 2 * (D2 + zb2);

        return (zb * (ac * ac + 2 * r2 * (r2 + r4) + 2 * r6 * (r2 - r4) - 2 * ac * (r2 + r6) + zb2) -
                Math.sqrt(-D2 * (AB + zb2) * ((ac + 2 * r4) * (ac - 2 * (r2 + r4 + r6)) + zb2))) / (2 * (D2 + zb2));
    }
}
