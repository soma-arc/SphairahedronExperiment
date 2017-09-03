import Spheirahedra from './spheirahedra.js';
import cubeParams from './cube/implementations.js';
import tetrahedraParams from './tetrahedron/implementations.js';
import { AttachShader, LinkProgram } from './glUtils';

const RENDER_VERTEX = require('./shaders/render.vert');

const RENDER_PARAM_SHADER = require('./shaders/parameter.frag');

export default class SpheirahedraHandler {
    constructor() {
        this.spheirahedraCubes = [];
        for (const Param of cubeParams) {
            this.spheirahedraCubes.push(new Param(0.2, 0));
        }
        this.tetrahedron = [];
        for (const Param of tetrahedraParams) {
            this.tetrahedron.push(new Param());
        }
        this.baseTypes = { 'cube': this.spheirahedraCubes,
                           'tetrahedron': this.tetrahedron };
        this.currentType = 'cube';
        this.currentSpheirahedra = this.baseTypes[this.currentType][0];
        this.currentSpheirahedra.update();

        this.spheirahedraPrograms = {};
        this.limitsetPrograms = {};
        this.prismPrograms = {};
        this.parameterPrograms = {};
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
                       'uniLocations': this.currentSpheirahedra.getUniformLocations(gl, program)};
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
            const limitsetShader = this.currentSpheirahedra.buildLimitsetShader();
            this.limitsetPrograms[this.currentType] = this.buildProgramUniLocationsPair(gl, limitsetShader);
        }
        return this.limitsetPrograms[this.currentType];
    }

    getParameterProgram(gl) {
        if (this.parameterPrograms[this.currentType] === undefined) {
            this.parameterPrograms[this.currentType] = this.buildProgramUniLocationsPair(gl, RENDER_PARAM_SHADER);
        }
        return this.parameterPrograms[this.currentType];
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

    setParamIndex(i) {
        if (cubeParams[i] !== undefined) {
            this.currentSpheirahedra = this.baseTypes[this.currentType][i];
            this.currentSpheirahedra.update();
        }
    }
}
