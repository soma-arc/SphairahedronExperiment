import Canvas2D from './canvas2d.js';
import Canvas3D from './canvas3d.js';

const PRISM_CANVAS_NAME = 'prismCanvas';
const LIMIT_SET_CANVAS_NAME = 'limitsetCanvas';
const SPHEIRAHEDRA_CANVAS_NAME = 'spheirahedraCanvas';
const PARAMETER_CANVAS_NAME = 'parameterCanvas';

export default class CanvasHandler {
    constructor(spheirahedraHandler) {
        this.spheirahedraHandler = spheirahedraHandler;
        this.prismCanvas = new Canvas3D(PRISM_CANVAS_NAME,
                                        this.spheirahedraHandler);
        this.limitsetCanvas = new Canvas3D(LIMIT_SET_CANVAS_NAME,
                                           this.spheirahedraHandler);
        this.spheirahedraCanvas = new Canvas3D(SPHEIRAHEDRA_CANVAS_NAME,
                                               this.spheirahedraHandler);
        this.parameterCanvas = new Canvas2D(PARAMETER_CANVAS_NAME,
                                            this.spheirahedraHandler);
        this.limitsetCanvas.displaySpheirahedraSphere = false;
        this.limitsetCanvas.isKeepingSampling = true;
        this.limitsetCanvas.isRenderingLowRes = true;

        this.limitsetSamplingTimer = undefined;

        this.spheirahedraHandler.changeSpheirahedron('cube');

        this.resizeCallback = this.resize.bind(this);
    }

    initCanvases() {
        this.prismCanvas.init();
        this.limitsetCanvas.init();
        this.spheirahedraCanvas.init();
        this.parameterCanvas.init();

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

    resize() {
        this.prismCanvas.resizeCanvas();
        this.limitsetCanvas.resizeCanvas();
        this.spheirahedraCanvas.resizeCanvas();
        this.parameterCanvas.resizeCanvas();

        this.prismCanvas.initRenderTextures();
        this.limitsetCanvas.initRenderTextures();
        this.limitsetCanvas.numSamples = 0;
        this.spheirahedraCanvas.initRenderTextures();

        this.prismCanvas.render();
        this.limitsetCanvas.render();
        this.spheirahedraCanvas.render();
        this.parameterCanvas.render();
    }

    reRenderCanvases() {
        if (this.limitsetSamplingTimer !== undefined) window.clearTimeout(this.limitsetSamplingTimer);
        this.limitsetCanvas.isKeepingSampling = false;
        this.limitsetCanvas.numSamples = 0;
        this.limitsetCanvas.render();
        this.prismCanvas.render();
        this.parameterCanvas.render();
        this.spheirahedraCanvas.render();
        this.limitsetSamplingTimer = window.setTimeout(() => {
            this.limitsetCanvas.isKeepingSampling = true;
        }, 500);
    }

    reRenderLimitsetCanvas() {
        if (this.limitsetSamplingTimer !== undefined) window.clearTimeout(this.limitsetSamplingTimer);
        this.limitsetCanvas.isKeepingSampling = false;
        this.limitsetCanvas.numSamples = 0;
        this.limitsetCanvas.callRender();
        this.limitsetSamplingTimer = window.setTimeout(() => {
            this.limitsetCanvas.isKeepingSampling = true;
        }, 500);
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

    changeRenderMode() {
        this.limitsetCanvas.setPrograms(
            this.spheirahedraHandler.getLimitsetProgram(this.limitsetCanvas.gl)
        );
        this.limitsetCanvas.render();
    }

    render() {
        if (this.limitsetCanvas.isProductRendering) {
            this.limitsetCanvas.renderProduct();
        } else if (this.limitsetCanvas.isRendering) {
            this.limitsetCanvas.numSamples = 0;
            this.limitsetCanvas.callRender();
        } else if (this.prismCanvas.isRendering) {
            this.prismCanvas.callRender();
        } else if (this.spheirahedraCanvas.isRendering) {
            this.spheirahedraCanvas.callRender();
        } else if (this.parameterCanvas.isTweaking) {
            this.limitsetCanvas.numSamples = 0;
            this.limitsetCanvas.callRender();
            this.prismCanvas.callRender();
            this.parameterCanvas.render();
            this.spheirahedraCanvas.callRender();
        } else if (this.limitsetCanvas.isKeepingSampling) {
            this.limitsetCanvas.render();
        }
    }
}
