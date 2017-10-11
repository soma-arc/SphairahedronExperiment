<template>
  <div id="root">
    <div id="content">
      <canvas-panel :canvasHandler="canvasHandler"
                    :spheirahedraHandler="spheirahedraHandler"/>
      <control-panel :canvasHandler="canvasHandler"
                     :spheirahedraHandler="spheirahedraHandler"/>
    </div>
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
#root {
    display: flex;
    flex-direction: column;
    height: 100%;
}

#content {
    flex:1;
	margin: 0; 
    display: flex;
    flex-direction: row;
    height: 100%;
}

canvas-panel {
    flex: 1;
    display: flex;
}

control-panel {
    width: 300px;
    display: flex;
}
</style>
