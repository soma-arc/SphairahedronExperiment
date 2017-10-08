<template>
  <div id="body">
    <canvas-panel :canvasHandler="canvasHandler"
                  :spheirahedraHandler="spheirahedraHandler"/>
    <control-panel :canvasHandler="canvasHandler"
                   :spheirahedraHandler="spheirahedraHandler"/>
  </div>
</template>

<script>
    import CanvasPanel from './canvasPanel.vue';
    import ControlPanel from './controlPanel.vue';

    export default {
        props: ['canvasHandler', 'spheirahedraHandler'],
        data: function() {
            return {
                selectedSpheirahedron: 'cube',
                currentRoute: window.location.pathname
            }
        },
        components: { ControlPanel, CanvasPanel },
        methods: {
            changeSpheirahedron: function(event) {
                this.canvasHandler.changeSpheirahedron(this.selectedSpheirahedron);
            },
            changeDihedralAngleType: function(event) {
                this.canvasHandler.changeDihedralAngleType(this.spheirahedraHandler.currentDihedralAngleIndex);
            },
            updateRenderParameter: function(event) {
                this.canvasHandler.reRenderLimitsetCanvas();
            },
            updateLimitSetShader: function(event) {
                this.canvasHandler.changeRenderMode();
            },
            renderSpheirahedraCanvas: function(even) {
                this.canvasHandler.spheirahedraCanvas.render();
            },
            renderPrismCanvas: function(event) {
                this.canvasHandler.prismCanvas.render();
            },
            reRenderAll: function(event) {
                this.canvasHandler.spheirahedraHandler.currentSpheirahedra.update();
                this.canvasHandler.reRenderCanvases();
            },
            saveSphairahedraPrismMesh: function(event) {
                this.spheirahedraHandler.saveSphairahedraPrismMesh();
            },
            saveSphairahedronMesh: function(event) {
                this.spheirahedraHandler.saveSphairahedronMesh();
            },
            changeCameraMode: function(event) {
                this.canvasHandler.limitsetCanvas.changeCamera();
                this.canvasHandler.reRenderLimitsetCanvas();
            },
            saveLimitsetImage: function(event) {
                this.canvasHandler.limitsetCanvas.saveCanvas('limitset.png');
            }
        }
}

</script>

<style>
#body {
    display: flex;
    flex-direction: row;
    margin-right:0;
    overflow: hidden;
}
</style>
