import Canvas2D from './canvas2d.js';
import Canvas3D from './canvas3d.js';

const PRISM_CANVAS_NAME = 'prismCanvas';
const LIMIT_SET_CANVAS_NAME = 'limitsetCanvas';
const SPHEIRAHEDRA_CANVAS_NAME = 'spheirahedraCanvas';
const PARAMETER_CANVAS_NAME = 'parameterCanvas';

const RENDER_PARAM_SHADER = require('./shaders/parameter.frag');

export default class CanvasHandler {
    constructor(spheirahedraHandler) {
        this.spheirahedraHandler = spheirahedraHandler;
        this.prismCanvas = new Canvas3D(PRISM_CANVAS_NAME,
                                        spheirahedraHandler);
        this.limitsetCanvas = new Canvas3D(LIMIT_SET_CANVAS_NAME,
                                           spheirahedraHandler);
        this.spheirahedraCanvas = new Canvas3D(SPHEIRAHEDRA_CANVAS_NAME,
                                               spheirahedraHandler);
        this.parameterCanvas = new Canvas2D(PARAMETER_CANVAS_NAME,
                                            spheirahedraHandler);
        this.changeSpheirahedron('cube');

        this.reRenderCanvases();

        const maxIterBox = document.getElementById('maxIter');
        maxIterBox.value = this.limitsetCanvas.maxIterations;
        maxIterBox.addEventListener('change', function(event) {
            this.limitsetCanvas.maxIterations = maxIterBox.value;
            this.limitsetCanvas.render();
        }.bind(this));

        const marchingThresholdBox = document.getElementById('marchingThreshold');
        marchingThresholdBox.value = this.limitsetCanvas.marchingThreshold;
        marchingThresholdBox.addEventListener('change', function(event) {
            this.limitsetCanvas.marchingThreshold = marchingThresholdBox.value;
            this.limitsetCanvas.render();
        }.bind(this));

        const fudgeFactorBox = document.getElementById('fudgeFactor');
        fudgeFactorBox.value = this.limitsetCanvas.fudgeFactor;
        fudgeFactorBox.addEventListener('change', function(event) {
            this.limitsetCanvas.fudgeFactor = fudgeFactorBox.value;
            this.limitsetCanvas.render();
        }.bind(this));

        const typeBox = document.getElementById('sphairahedraTypeBox');
        typeBox.addEventListener('change', function(event) {
            this.changeSpheirahedron(typeBox.value);
        }.bind(this))
    }

    reRenderCanvases() {
        this.limitsetCanvas.render();
        this.prismCanvas.render();
        this.parameterCanvas.render();
        this.spheirahedraCanvas.render();
    }

    changeSpheirahedron(typeName) {
        if (typeName === this.spheirahedraHandler.currentType) return;

        this.spheirahedraHandler.changeSpheirahedron(typeName);

        this.spheirahedraCanvas.setPrograms(
            this.spheirahedraHandler.getSpheirahedraProgram(this.spheirahedraCanvas.gl));
        this.limitsetCanvas.setPrograms(
            this.spheirahedraHandler.getLimitsetProgram(this.limitsetCanvas.gl)
        );
        this.prismCanvas.setPrograms(
            this.spheirahedraHandler.getPrismProgram(this.prismCanvas.gl)
        );
        this.parameterCanvas.setPrograms(
            this.spheirahedraHandler.getParameterProgram(this.parameterCanvas.gl)
        );

        this.reRenderCanvases();
    }

    changeDihedralAngleType(n) {
        this.spheirahedraHandler.changeDihedralAngleType(n);
        this.parameterCanvas.setPrograms(
            this.spheirahedraHandler.getParameterProgram(this.parameterCanvas.gl)
        );
        this.reRenderCanvases();
    }

    render() {
        if (this.limitsetCanvas.isRendering) {
            this.limitsetCanvas.render();
        } else if (this.prismCanvas.isRendering) {
            this.prismCanvas.render();
        } else if (this.spheirahedraCanvas.isRendering) {
            this.spheirahedraCanvas.render();
        } else if (this.parameterCanvas.isTweaking) {
            this.limitsetCanvas.render();
            this.prismCanvas.render();
            this.parameterCanvas.render();
            this.spheirahedraCanvas.render();
        }
    }
}
