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
                                        spheirahedraHandler);
        this.limitsetCanvas = new Canvas3D(LIMIT_SET_CANVAS_NAME,
                                           spheirahedraHandler);
        this.spheirahedraCanvas = new Canvas3D(SPHEIRAHEDRA_CANVAS_NAME,
                                               spheirahedraHandler);
        this.parameterCanvas = new Canvas2D(PARAMETER_CANVAS_NAME,
                                            spheirahedraHandler);
        this.changeSpheirahedron('cube');

        this.limitsetCanvas.displaySpheirahedraSphere = false;
        this.limitsetCanvas.isKeepingSampling = true;
        this.limitsetCanvas.isRenderingLowRes = true;
        this.reRenderCanvases();
    }

    reRenderCanvases() {
        this.limitsetCanvas.numSamples = 0;
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

    changeRenderMode() {
        this.limitsetCanvas.setPrograms(
            this.spheirahedraHandler.getLimitsetProgram(this.limitsetCanvas.gl)
        );
        this.limitsetCanvas.render();
    }

    render() {
        if (this.limitsetCanvas.isRendering) {
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
