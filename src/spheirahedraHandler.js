import Spheirahedra from './spheirahedra.js';
import cubeParams from './cube/index.js';

export default class SpheirahedraHandler {
    constructor() {
        this.baseTypes = { 'cube': cubeParams };
        this.spheirahedraCubes = [];
        for (const Param of cubeParams) {
            this.spheirahedraCubes.push(new Param(0, 0));
        }
        this.currentSpheirahedra = this.spheirahedraCubes[0];
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
            this.currentSpheirahedra = this.spheirahedraCubes[i];
            this.currentSpheirahedra.update();
        }
    }
}
