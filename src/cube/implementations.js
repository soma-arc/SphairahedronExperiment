
import Sphere from '../sphere.js';
import Spheirahedra from '../spheirahedra.js';
import SpheirahedraCube from './spheirahedraCube.js';

const SQRT_3 = Math.sqrt(3);
const SQRT_2 = Math.sqrt(2);

class CubeA extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = 0.5 + (this.zb * this.zc) / 3.0;
        const r4 = 0.5 + (this.zb * this.zb - this.zb * this.zc) / 3.0;
        const r6 = 0.5 + (-this.zb * this.zc + this.zc * this.zc) / 3.0;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(-(1 - r4) * 0.5, this.zb, Math.sqrt(3) * (1 - r4) * 0.5, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -Math.sqrt(3) * (1 - r6) * 0.5, r6);

        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        return {
            'conditions': ['xy - (3. / 4.)',
                           'xx - xy - (3. / 4.)',
                           'yy - xy - (3. / 4.)',
                           'y - x * 2.'],
            'regionCondition': 'x > 0. && y > 0. && ' +
                'y > x * 2. && ' +
                'yy - xy - (3. / 4.) < 0.'
        }
    }
}

class CubeB extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = (3 * SQRT_3 + 2 * SQRT_3 * this.zb * this.zc) / 9.0;
        const r4 = (3 * this.zb * this.zb - 4 * this.zb * this.zc + 3) / 9.0;
        const r6 = (3 * this.zc * this.zc - 2 * this.zb * this.zc + 6) / 9.0;
        const s2 = new Sphere((2 - SQRT_3 * r2) * 0.5, 0, r2 * 0.5, r2);
        const s4 = new Sphere(-(1 - r4) * 0.5, this.zb, SQRT_3 * (1 - r4) * 0.5, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);
        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        return {
            'conditions': ['-2. * SQRT_3 * xy + 54.0 - 30.0 * SQRT_3',
                           '-3. * xx + 4. * xy + 15.0 / 4.0',
                           '2. * xy - 3. * yy + (3. / 4.)'],
            'regionCondition': 'x > 0. && ' +
                '(-2. * SQRT_3 * xy + 54.0 - 30.0 * SQRT_3) > 0. && ' +
                '(-3. * xx + 4. * xy + 15.0 / 4.0) > 0. && ' +
                '(2. * xy -3. * yy + (3. / 4.)) > 0.'
        }
    }
}

class CubeC extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_333;
    }

    computeSpheres() {
        const r2 = (this.zb * this.zb + 2 * this.zb * this.zc + 6) / (5 * SQRT_3);
        const r4 = (3 * this.zb * this.zb - 4 * this.zb * this.zc + 3) / (5 * SQRT_3);
        const r6 = (-this.zb * this.zb - 2 * this.zb * this.zc + 5 * this.zc * this.zc + 9) / 15.0;
        const s2 = new Sphere((2 - SQRT_3 * r2) * 0.5, 0, r2 * 0.5, r2);
        const s4 = new Sphere(-0.5, this.zb, SQRT_3 / 2 - r4, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);

        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        return {
            'conditions': ['-SQRT_3 * xx - 2. * SQRT_3 * xy + 90. - 51.0 * SQRT_3',
                           '-3. * SQRT_3 * xx + 4. * SQRT_3 * xy + 90. - 48.0 * SQRT_3',
                           'xx + 2. * xy - 5. * yy + (9. / 4.)'],
            'regionCondition': 'x > 0. && ' +
                '(-SQRT_3 * xx- 2. * SQRT_3 * xy + 90. - 51.0 * SQRT_3) > 0. &&' +
                '(-3. * SQRT_3 * xx + 4. * SQRT_3 * xy + 90. - 48.0 * SQRT_3) > 0. &&' +
                '(xx + 2. * xy - 5. * yy + (9. / 4.)) > 0.'
        }
    }
}

class CubeD extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_236;
    }

    computeSpheres() {
        const r2 = (3 * this.zb * this.zb + this.zc * this.zc + 6 * this.zb * this.zc + 6) / 18;
        const r4 = (15 * this.zb * this.zb - this.zc * this.zc - 6 * this.zb * this.zc + 12) / (18 * SQRT_3);
        const r6 = (-3 * this.zb * this.zb + 5 * this.zc * this.zc - 6 * this.zb * this.zc + 12) / 18.0;
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(0.5, this.zb, SQRT_3 / 2 - r4, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -SQRT_3 * (1 - r6) * 0.5, r6);

        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        return {
            'conditions': ['-3. * xx - 6. * xy - yy - 60. + 36. * SQRT_3',
                           '-15. * xx + 6. * xy + yy - 120. + 72. * SQRT_3',
                           '3. * xx + 6. * xy - 5. * yy - 120. + 72. * SQRT_3 '],
            'regionCondition': 'x > 0. && ' +
                '-3. * xx - 6. * xy - yy - 60. + 36. * SQRT_3 > 0. &&' +
                '-15. * xx + 6. * xy + yy - 120. + 72. * SQRT_3 > 0. &&' +
                '3. * xx + 6. * xy - 5. * yy - 120. + 72. * SQRT_3 > 0.'
        }
    }
}

class CubeE extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_236;
    }

    computeSpheres() {
        const r2 = (this.zc * this.zc + 6 * this.zb * this.zc + 3) / (7 * SQRT_3);
        const r4 = (7 * this.zb * this.zb - this.zc * this.zc - 6 * this.zb * this.zc + 4) / (14);
        const r6 = (2 * this.zc * this.zc - 2 * this.zb * this.zc + 6) / 7.0;
        const s2 = new Sphere(1 - SQRT_3 * 0.5 * r2, 0, r2 * 0.5, r2);
        const s4 = new Sphere((1 + r4) * 0.5, this.zb, (1 - r4) * SQRT_3 * 0.5, r4);
        const s6 = new Sphere(-(1 - r6) * 0.5, this.zc, -(1 - r6) * SQRT_3 * 0.5, r6);

        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        // It may contain mistake.
        const conditions = ['-6. * xy - yy + 9. / 4.',
                            '(7. * xx - 6. * xy - yy - 3.)',
                            'xy - yy - 24. + 14. * SQRT_3']
        let regionConditions = 'x > 0.';
        for (const cond of conditions) {
            regionConditions += '&&'
            regionConditions += cond + ' > 0.'
        }
        return {
            'conditions': conditions,
            'regionCondition': regionConditions
        }
    }
}

class CubeH extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_236;
    }

    computeSpheres() {
        const r2 = (3 * this.zb * this.zb + 2 * this.zb * this.zc + 3) / (5 * SQRT_3);
        const r4 = 2 * (this.zb * this.zb - this.zb * this.zc + 1) / (5);
        const r6 = (-3 * this.zb * this.zb - 2 * this.zb * this.zc + 5 * this.zc * this.zc + 12) / (10 * SQRT_3);
        const s2 = new Sphere(1 - SQRT_3 / 2 * r2, 0, r2 / 2, r2);
        const s4 = new Sphere((1 - r4) / 2, this.zb, (1 - r4) * SQRT_3 / 2, r4);
        const s6 = new Sphere(SQRT_3 / 2 * r6 - 0.5, this.zc, (-SQRT_3 + r6) / 2, r6);

        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        const conditions = ['-3. * xx - 2. * xy + 3. / 4.',
                            '-3. * xx + 3. * xy + 2.',
                            '2. * xx + 2. * xy - 5. * yy + 3.']
        let regionConditions = 'x > 0.';
        for (const cond of conditions) {
            regionConditions += '&&'
            regionConditions += cond + ' > 0.'
        }
        return {
            'conditions': conditions,
            'regionCondition': regionConditions
        }
    }
}

class CubeI extends SpheirahedraCube {
    constructor(tb, tc) {
        super(tb, tc);
        this.planes = Spheirahedra.PRISM_PLANES_244;
    }

    computeSpheres() {
        const r2 = (this.zc * this.zc + 2 * this.zb * this.zc + 2) / 6;
        const r4 = SQRT_2 * (-this.zc * this.zc - 2 * this.zb * this.zc + 3 * this.zb * this.zb + 4) / 12;
        const r6 = (this.zc * this.zc - this.zb * this.zc + 2) / (3);
        const s2 = new Sphere(1 - r2, 0, 0, r2);
        const s4 = new Sphere(r4 / SQRT_2, this.zb, 1 - r4 / SQRT_2, r4);
        const s6 = new Sphere(0, this.zc, -1 + r6, r6);

        this.prismSpheres = [s2, s4, s6];
    }

    getParameterSpaceContext() {
        const conditions = ['-2. * xy - yy + 1.',
                            '-3. * xx + 2. * xy + yy + 2.',
                            'xy - yy - 8. + 6. * SQRT_2']
        let regionConditions = 'x > 0.';
        for (const cond of conditions) {
            regionConditions += '&&'
            regionConditions += cond + ' > 0.'
        }
        return {
            'conditions': conditions,
            'regionCondition': regionConditions
        }
    }
}

export default [CubeA, CubeB, CubeC, CubeD, CubeE,
                CubeH, CubeI];
