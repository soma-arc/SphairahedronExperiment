import Spheirahedra from './spheirahedra.js';
import SpheirahedraCubeA from './cube/spheirahedraCubeA.js';

export default class SpheirahedraHandler {
    constructor() {
        this.baseTypes = { 'cube': SpheirahedraCubeA };
        this.currentSpheirahedra = new SpheirahedraCubeA(0, 0);
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
}
