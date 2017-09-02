import Spheirahedra from './spheirahedra.js';
import cubeParams from './cube/implementations.js';
import tetrahedraParams from './tetrahedron/implementations.js';

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
        this.baseTypes = { 'cube': this.spheirahedraCubes,
                           'tetrahedron': this.tetrahedron };
        this.currentType = 'tetrahedron';
        this.currentSpheirahedra = this.baseTypes[this.currentType][0];
        this.currentSpheirahedra.update();
    }

    select(mouse, scale) {
        this.currentSpheirahedra.select(mouse, scale);
    }

    move(mouse) {
        return this.currentSpheirahedra.move(mouse);
    }

    setUniformValues(gl, uniLocations, uniI, scale) {
        this.currentSpheirahedra.setUniformValues(gl, uniLocations,
                                                  uniI, scale);
    }

    setUniformLocations(gl, uniLocations, program) {
        Spheirahedra.setUniformLocations(gl, uniLocations, program);
    }

    setParamIndex(i) {
        if (cubeParams[i] !== undefined) {
            this.currentSpheirahedra = this.baseTypes[this.currentType][i];
            this.currentSpheirahedra.update();
        }
    }
}
