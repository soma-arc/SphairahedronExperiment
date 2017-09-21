import cubeParams from './cube/implementations.js';
import tetrahedraParams from './tetrahedron/implementations.js';
import pentahedralPyramid from './pentahedralPyramid/implementations.js';
import pentahedralPrism from './pentahedralPrism/implementations.js';
import hexahedralCake2 from './hexahedralCake2/implementations.js';
import hexahedralCake3 from './hexahedralCake3/implementations.js';
import { AttachShader, LinkProgram } from './glUtils';

const RENDER_VERTEX = require('./shaders/render.vert');

export default class SpheirahedraHandler {
    constructor() {
        this.spheirahedraCubes = [];
        for (const Param of cubeParams) {
            this.spheirahedraCubes.push(new Param(0, 0));
        }
        this.tetrahedron = [];
        for (const Param of tetrahedraParams) {
            this.tetrahedron.push(new Param());
        }
        this.pentahedralPyramid = [];
        for (const Param of pentahedralPyramid) {
            this.pentahedralPyramid.push(new Param());
        }
        this.pentahedralPrism = [];
        for (const Param of pentahedralPrism) {
            this.pentahedralPrism.push(new Param(0));
        }
        this.hexahedralCake2 = [];
        for (const Param of hexahedralCake2) {
            this.hexahedralCake2.push(new Param(0));
        }
        this.hexahedralCake3 = [];
        for (const Param of hexahedralCake3) {
            this.hexahedralCake3.push(new Param(0));
        }

        this.baseTypes = { 'cube': this.spheirahedraCubes,
                           'tetrahedron': this.tetrahedron,
                           'pentahedralPyramid': this.pentahedralPyramid,
                           'pentahedralPrism': this.pentahedralPrism,
                           'hexahedralCake2': this.hexahedralCake2,
                           'hexahedralCake3': this.hexahedralCake3 };
        this.currentType = '';
        this.currentDihedralAngleIndex = -1;
        this.currentSpheirahedra = undefined;

        this.spheirahedraPrograms = {};
        this.limitsetPrograms = {};
        this.prismPrograms = {};
        this.parameterPrograms = {};

        this.limitRenderingMode = 0;
    }

    static buildRenderProgram(gl, fragment) {
        const program = gl.createProgram();
        AttachShader(gl, RENDER_VERTEX,
                     program, gl.VERTEX_SHADER);
        AttachShader(gl, fragment,
                     program, gl.FRAGMENT_SHADER);
        LinkProgram(gl, program);
        return program;
    }

    buildProgramUniLocationsPair(gl, shader) {
        const program = SpheirahedraHandler.buildRenderProgram(gl, shader);
        const pair = { 'program': program,
                       'uniLocations': this.currentSpheirahedra.getUniformLocations(gl, program) };
        return pair;
    }

    getSpheirahedraProgram(gl) {
        if (this.spheirahedraPrograms[this.currentType] === undefined) {
            const spheirahedraShader = this.currentSpheirahedra.buildSpheirahedraShader();
            this.spheirahedraPrograms[this.currentType] = this.buildProgramUniLocationsPair(gl, spheirahedraShader);
        }
        return this.spheirahedraPrograms[this.currentType];
    }

    getPrismProgram(gl) {
        if (this.prismPrograms[this.currentType] === undefined) {
            const prismShader = this.currentSpheirahedra.buildPrismShader();
            this.prismPrograms[this.currentType] = this.buildProgramUniLocationsPair(gl, prismShader);
        }
        return this.prismPrograms[this.currentType];
    }

    getLimitsetProgram(gl) {
        if (this.limitsetPrograms[this.currentType] === undefined) {
            this.limitsetPrograms[this.currentType] = new Array(3);
        }
        if (this.limitsetPrograms[this.currentType][this.limitRenderingMode] === undefined) {
            const limitsetShader = this.currentSpheirahedra.buildLimitsetShader(this.limitRenderingMode);
            this.limitsetPrograms[this.currentType][this.limitRenderingMode] = this.buildProgramUniLocationsPair(gl, limitsetShader);
        }
        return this.limitsetPrograms[this.currentType][this.limitRenderingMode];
    }

    getParameterProgram(gl) {
        if (this.parameterPrograms[this.currentType] === undefined) {
            this.parameterPrograms[this.currentType] = new Array(50);
        }
        if (this.parameterPrograms[this.currentType][this.currentDihedralAngleIndex] === undefined) {
            const parameterShader = this.currentSpheirahedra.buildParameterSpaceShader();
            this.parameterPrograms[this.currentType][this.currentDihedralAngleIndex] = this.buildProgramUniLocationsPair(gl, parameterShader);
        }
        return this.parameterPrograms[this.currentType][this.currentDihedralAngleIndex];
    }

    select(mouse, scale) {
        this.currentSpheirahedra.select(mouse, scale);
    }

    move(mouse) {
        return this.currentSpheirahedra.move(mouse);
    }

    setUniformValues(gl, uniLocations, uniI, scale) {
        this.currentSpheirahedra.setUniformValues(gl,
                                                  uniLocations,
                                                  uniI, scale);
    }

    changeDihedralAngleType(i) {
        if (this.baseTypes[this.currentType][i] !== undefined) {
            this.currentSpheirahedra = this.baseTypes[this.currentType][i];
            this.currentDihedralAngleIndex = i;
            this.currentSpheirahedra.update();
        }
    }

    changeSpheirahedron(typeName) {
        if (this.baseTypes[typeName] !== undefined) {
            this.currentType = typeName;
            this.currentSpheirahedra = this.baseTypes[this.currentType][0];
            this.currentDihedralAngleIndex = 0;
            this.currentSpheirahedra.update();
        }
    }
}
