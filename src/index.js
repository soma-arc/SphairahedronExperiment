import Canvas3D from './canvas3d.js';
import Canvas2D from './canvas2d.js';
import Spheirahedra from './spheirahedraC.js';
import SpheirahedraPrism from './spheiraPrism.js';
import SpheiraCake1 from './spheiraCake1.js';

const RENDER_PRISM = require('./shaders//spheiraPrism.frag');
const RENDER_SPHEIRAHEDRA = require('./shaders/spheirahedra.frag');
const RENDER_LIMIT_SET = require('./shaders/limitset.frag');

const RENDER_PARAMETER = require('./shaders/parameter.frag');
const RENDER_PARAMETER_B = require('./shaders/parameterC.frag');

const RENDER_PRISM_TWO_SPHERES = require('./shaders/spheiraPrism.frag');
const RENDER_PRISM_LIMITSET = require('./shaders/prismLimitset.frag');
const RENDER_SPHEIRAHEDRA_TWO_SPHERES = require('./shaders/spheirahedraPrismTwoSpheres.frag');

const RENDER_SPHEIRA_INF_CAKE = require('./shaders/spheiraCake.frag');
const RENDER_LIMIT_CAKE = require('./shaders/cakeLimitset.frag');

window.addEventListener('load', () => {
    const spheirahedra = new Spheirahedra(0, Math.sqrt(3) / 2);
    const spheirahedraPrism = new SpheirahedraPrism(1.78);
    const spheiraCake1 = new SpheiraCake1(1.5);
    //    const prismCanvas = new Canvas3D('prismCanvas', spheirahedra, RENDER_PRISM);
    //    const prismCanvas = new Canvas3D('prismCanvas', spheirahedraPrism, RENDER_PRISM_TWO_SPHERES);
    const prismCanvas = new Canvas3D('prismCanvas', spheiraCake1, RENDER_SPHEIRA_INF_CAKE);
    // const limitsetCanvas = new Canvas3D('limitsetCanvas', spheirahedra, RENDER_LIMIT_SET);
    //    const limitsetCanvas = new Canvas3D('limitsetCanvas', spheirahedraPrism, RENDER_PRISM_LIMITSET);
    const limitsetCanvas = new Canvas3D('limitsetCanvas', spheiraCake1, RENDER_LIMIT_CAKE);
    // const parameterCanvas = new Canvas2D('parameterCanvas', spheirahedra, RENDER_PARAMETER_B);
    //    const parameterCanvas = new Canvas2D('parameterCanvas', spheirahedraPrism, RENDER_PARAMETER_B);
    const parameterCanvas = new Canvas2D('parameterCanvas', spheiraCake1, RENDER_PARAMETER_B);
    // const spheirahedraCanvas = new Canvas3D('spheirahedraCanvas', spheirahedra, RENDER_SPHEIRAHEDRA);
    const spheirahedraCanvas = new Canvas3D('spheirahedraCanvas', spheirahedraPrism, RENDER_SPHEIRAHEDRA_TWO_SPHERES);
    prismCanvas.render();
    limitsetCanvas.render();
    parameterCanvas.render();
    spheirahedraCanvas.render();

    const maxIterBox = document.getElementById('maxIter');
    maxIterBox.value = limitsetCanvas.maxIterations;
    maxIterBox.addEventListener('change', function(event) {
        limitsetCanvas.maxIterations = maxIterBox.value;
        limitsetCanvas.render();
    });

    const marchingThresholdBox = document.getElementById('marchingThreshold');
    marchingThresholdBox.value = limitsetCanvas.marchingThreshold;
    marchingThresholdBox.addEventListener('change', function(event) {
        limitsetCanvas.marchingThreshold = marchingThresholdBox.value;
        limitsetCanvas.render();
    });

    const fudgeFactorBox = document.getElementById('fudgeFactor');
    fudgeFactorBox.value = limitsetCanvas.fudgeFactor;
    fudgeFactorBox.addEventListener('change', function(event) {
        limitsetCanvas.fudgeFactor = fudgeFactorBox.value;
        limitsetCanvas.render();
    });

    function renderLoop() {
        if (limitsetCanvas.isRendering) {
            limitsetCanvas.render();
        } else if (prismCanvas.isRendering) {
            prismCanvas.render();
        } else if (spheirahedraCanvas.isRendering) {
            spheirahedraCanvas.render();
        } else if (parameterCanvas.isTweaking) {
            limitsetCanvas.render();
            prismCanvas.render();
            parameterCanvas.render();
            spheirahedraCanvas.render();
        }

        requestAnimationFrame(renderLoop);
    }

    renderLoop();
});
