import SpheirahedraHandler from './spheirahedraHandler.js';
import CanvasHandler from './canvasHandler.js';

window.addEventListener('load', () => {
    const spheirahedraHandler = new SpheirahedraHandler();
    const canvasHandler = new CanvasHandler(spheirahedraHandler);

    function renderLoop() {
        canvasHandler.render();
        requestAnimationFrame(renderLoop);
    }

    window.addEventListener('keydown', (event) => {
        console.log(event.key);
        const n = Number(event.key);
        if (n <= 9) {
            canvasHandler.changeDihedralAngleType(n);
        }
        if (event.key === 'q') {
            canvasHandler.changeSpheirahedron('cube');
        } else if (event.key === 'w') {
            canvasHandler.changeSpheirahedron('tetrahedron');
        } else if (event.key === 'e') {
            canvasHandler.changeSpheirahedron('pentahedralPyramid');
        } else if (event.key === 'r') {
            canvasHandler.changeSpheirahedron('pentahedralPrism');
        } else if (event.key === 't') {
            canvasHandler.changeSpheirahedron('hexahedralCake2');
        } else if (event.key === 'y') {
            canvasHandler.changeSpheirahedron('hexahedralCake3');
        }
    });

    renderLoop();
});
