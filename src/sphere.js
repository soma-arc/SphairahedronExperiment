import Vec3 from './vector3d.js';
import Plane from './plane.js';

export default class Sphere {
    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} r
     */
    constructor (x, y, z, r) {
        this.center = new Vec3(x, y, z);
        this.r = r;
        this.update();

        this.basisRadius = 20;
    }

    update() {
        this.rSq = this.r * this.r;
    }

    setObjBasisUniformValues(gl, uniLocation, uniIndex) {
        gl.uniform3f(uniLocation[uniIndex++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.basisRadius);
        gl.uniform1f(uniLocation[uniIndex++],
                     this.r);
        gl.uniform1i(uniLocation[uniIndex++], false);
        gl.uniform2f(uniLocation[uniIndex++], 0, 0);
        return uniIndex;
    }

    setUniformValues(gl, uniLocation, uniIndex) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.center.x, this.center.y, this.center.z);
        gl.uniform2f(uniLocation[uniI++],
                     this.r, this.rSq);
        gl.uniform1i(uniLocation[uniI++],
                     this.selected);
        return uniI;
    }

    cloneDeeply() {
        const s = new Sphere(this.center.x, this.center.y, this.center.z, this.r);
        s.selected = this.selected;
        return s;
    }

    /**
     *
     * @param {Vec3} p
     * @returns {Vec3}
     */
    invertOnPoint(p) {
        const d = p.sub(this.center);
        const len = d.length();
        return d.scale(this.rSq / (len * len)).add(this.center);
    }

    /**
     *
     * @param {} mat
     * @param {number} n
     * @param {number} k
     * @returns {}
     */
    static pivoting(mat, n, k) {
        var col = k;
        var maxValue = Math.abs(mat[k][k]);
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(mat[i][k]) > maxValue) {
                col = i;
                maxValue = Math.abs(mat[i][k]);
            }
        }
        if (k !== col) {
            var tmp = mat[col];
            mat[col] = mat[k];
            mat[k] = tmp;
        }
        return mat;
    }

    /**
     *
     * @param {Vec3} p1
     * @param {Vec3} p2
     * @param {Vec3} p3
     * @param {Vec3} p4
     * @returns {Sphere}
     */
    static fromPoints(p1, p2, p3, p4) {
        const p = [p1, p2, p3, p4];
        let coefficient = [[], [], []];
        for (let i = 0; i < 3; i++) {
            coefficient[i][0] = 2 * (p[i + 1].x - p[i].x);
            coefficient[i][1] = 2 * (p[i + 1].y - p[i].y);
            coefficient[i][2] = 2 * (p[i + 1].z - p[i].z);
            coefficient[i][3] = -(Math.pow(p[i].x, 2) + Math.pow(p[i].y, 2) + Math.pow(p[i].z, 2)) +
                Math.pow(p[i + 1].x, 2) + Math.pow(p[i + 1].y, 2) + Math.pow(p[i + 1].z, 2);
        }

        // Gaussian elimination
        // Implementation is based on http://www.slis.tsukuba.ac.jp/~fujisawa.makoto.fu/cgi-bin/wiki/index.php?%A5%D4%A5%DC%A5%C3%A5%C8%C1%AA%C2%F2
        // forward elimination
        const n = 3;
        for (let k = 0; k < n - 1; k++) {
            coefficient = Sphere.pivoting(coefficient, n, k);

            const vkk = coefficient[k][k];
            for (let i = k + 1; i < n; i++) {
                const vik = coefficient[i][k];
                for (let j = k; j < n + 1; ++j) {
                    coefficient[i][j] = coefficient[i][j] - vik * (coefficient[k][j] / vkk);
                }
            }
        }

        // back substitution
        coefficient[n - 1][n] = coefficient[n - 1][n] / coefficient[n - 1][n - 1];
        for (let i = n - 2; i >= 0; i--) {
            let acc = 0.0;
            for (let j = i + 1; j < n; j++) {
                acc += coefficient[i][j] * coefficient[j][n];
            }
            coefficient[i][n] = (coefficient[i][n] - acc) / coefficient[i][i];
        }

        const center = new Vec3(coefficient[0][3], coefficient[1][3], coefficient[2][3]);
        const r = center.sub(p1).length();
        return new Sphere(center.x, center.y, center.z, r);
    }

    /**
     *
     * @param {Sphere} invertSphere
     * @returns {Sphere}
     */
    invertOnSphere(invertSphere) {
        const r = invertSphere.r;
        const RT_3 = Math.sqrt(3);
        const coeffR = r * RT_3 / 3;
        const p1 = this.invertOnPoint(invertSphere.center.add(new Vec3(coeffR, coeffR, coeffR)));
        const p2 = this.invertOnPoint(invertSphere.center.add(new Vec3(-coeffR, -coeffR, -coeffR)));
        const p3 = this.invertOnPoint(invertSphere.center.add(new Vec3(coeffR, -coeffR, -coeffR)));
        const p4 = this.invertOnPoint(invertSphere.center.add(new Vec3(coeffR, coeffR, -coeffR)));
        return Sphere.fromPoints(p1, p2, p3, p4);
    }

    /**
     *
     * @param {Plane} plane
     * @returns {}
     */
    invertOnPlane(plane) {
        return Sphere.fromPoints(this.invertOnPoint(plane.p1),
                                 this.invertOnPoint(plane.p2),
                                 this.invertOnPoint(plane.p3),
                                 this.center);
    }
}
