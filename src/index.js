import Canvas3D from './canvas3d.js';
import Canvas2D from './canvas2d.js';
import Spheirahedra from './spheirahedraC.js';

const RENDER_PRISM = require('./shaders//spheiraPrism.frag');
const RENDER_SPHEIRAHEDRA = require('./shaders/spheirahedra.frag');
const RENDER_LIMIT_SET = require('./shaders/limitset.frag');

const RENDER_PARAMETER = require('./shaders/parameter.frag');
const RENDER_PARAMETER_B = require('./shaders/parameterC.frag');

window.addEventListener('load', () => {
    const spheirahedra = new Spheirahedra(0, Math.sqrt(3) / 2);
    const prismCanvas = new Canvas3D('prismCanvas', spheirahedra, RENDER_PRISM);
    const limitsetCanvas = new Canvas3D('limitsetCanvas', spheirahedra, RENDER_LIMIT_SET);
    const parameterCanvas = new Canvas2D('parameterCanvas', spheirahedra, RENDER_PARAMETER_B);
    const spheirahedraCanvas = new Canvas3D('spheirahedraCanvas', spheirahedra, RENDER_SPHEIRAHEDRA);
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
