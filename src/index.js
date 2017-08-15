import Canvas3D from './canvas3d.js';
import Spheirahedra from './spheirahedra.js';

const RENDER_PRISM = require('./shaders/spheiraPrism.frag');
const RENDER_SPHEIRAHEDRA = require('./shaders/spheirahedra.frag');
const RENDER_LIMIT_SET = require('./shaders/limitset.frag');

window.addEventListener('load', () => {
    const spheirahedra = new Spheirahedra(0, Math.sqrt(3) / 2);
    const canvas = new Canvas3D('canvas', spheirahedra, RENDER_SPHEIRAHEDRA);
    const canvas2 = new Canvas3D('canvas2', spheirahedra, RENDER_LIMIT_SET);
    canvas.render();
    canvas2.render();
});

