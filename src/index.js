import Canvas3D from './canvas3d.js';
import Canvas2D from './canvas2d.js';
import Spheirahedra from './spheirahedraC.js';
import SpheirahedraPrism from './spheiraPrism.js';
import SpheiraCake1 from './spheiraCake1.js';
import SpheirahedraHandler from './spheirahedraHandler.js';

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
    const spheirahedraHandler = new SpheirahedraHandler();
    const prismCanvas = new Canvas3D('prismCanvas', spheirahedraHandler, RENDER_PRISM);
    const limitsetCanvas = new Canvas3D('limitsetCanvas', spheirahedraHandler, RENDER_LIMIT_SET);
    const parameterCanvas = new Canvas2D('parameterCanvas', spheirahedraHandler, RENDER_PARAMETER);
    const spheirahedraCanvas = new Canvas3D('spheirahedraCanvas', spheirahedraHandler, RENDER_SPHEIRAHEDRA);

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
