import Vue from 'vue';
import SpheirahedraHandler from './spheirahedraHandler.js';
import CanvasHandler from './canvasHandler.js';
import Root from './vue/root.vue';

window.addEventListener('load', () => {
    const spheirahedraHandler = new SpheirahedraHandler();
    const canvasHandler = new CanvasHandler(spheirahedraHandler);

    const d = { 'canvasHandler': canvasHandler,
                'spheirahedraHandler': spheirahedraHandler };

    /* eslint-disable no-unused-vars */
    const app = new Vue({
        el: '#vue-ui',
        data: d,
        render: (h) => {
            return h('root', { 'props': d });
        },
        components: { 'root': Root }
    });

    canvasHandler.initCanvases();

    function renderLoop() {
        canvasHandler.render();
        requestAnimationFrame(renderLoop);
    }

    renderLoop();
});
