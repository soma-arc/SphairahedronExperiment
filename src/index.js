import SpheirahedraHandler from './spheirahedraHandler.js';
import CanvasHandler from './canvasHandler.js';

window.addEventListener('load', () => {
    const spheirahedraHandler = new SpheirahedraHandler();
    const canvasHandler = new CanvasHandler(spheirahedraHandler);

    // const maxIterBox = document.getElementById('maxIter');
    // maxIterBox.value = limitsetCanvas.maxIterations;
    // maxIterBox.addEventListener('change', function(event) {
    //     limitsetCanvas.maxIterations = maxIterBox.value;
    //     limitsetCanvas.render();
    // });

    // const marchingThresholdBox = document.getElementById('marchingThreshold');
    // marchingThresholdBox.value = limitsetCanvas.marchingThreshold;
    // marchingThresholdBox.addEventListener('change', function(event) {
    //     limitsetCanvas.marchingThreshold = marchingThresholdBox.value;
    //     limitsetCanvas.render();
    // });

    // const fudgeFactorBox = document.getElementById('fudgeFactor');
    // fudgeFactorBox.value = limitsetCanvas.fudgeFactor;
    // fudgeFactorBox.addEventListener('change', function(event) {
    //     limitsetCanvas.fudgeFactor = fudgeFactorBox.value;
    //     limitsetCanvas.render();
    // });

    function renderLoop() {
        canvasHandler.render();
        requestAnimationFrame(renderLoop);
    }

    // window.addEventListener('keydown', (event) => {
    //     console.log(event.key);
    //     const n = Number(event.key);
    //     if (n <= 9) {
    //         spheirahedraHandler.setParamIndex(n);
    //         prismCanvas.render();
    //         limitsetCanvas.render();
    //         parameterCanvas.render();
    //         spheirahedraCanvas.render();
    //     }
    // });

    renderLoop();
});
