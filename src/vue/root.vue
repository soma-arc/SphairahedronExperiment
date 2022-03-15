<template>
<div id="root">
  <header-panel/>
  <middle-panel :canvasHandler="canvasHandler"
                :spheirahedraHandler="spheirahedraHandler"/>
  <footer-panel/>
</div>
</template>

<script>
import HeaderPanel from './headerPanel.vue';
import MiddlePanel from './middlePanel.vue';
import FooterPanel from './footerPanel.vue';
export default {
    props: ['canvasHandler', 'spheirahedraHandler'],
    data: function() {
        return {
            selectedSpheirahedron: 'cube',
            currentRoute: window.location.pathname
        }
    },
    components: { MiddlePanel, HeaderPanel, FooterPanel },
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
    margin: 0;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
}

#content {
	margin: 0; 
    display: flex;
    flex-direction: row;
    height: 100%;
}

header-panel {
    flex: 1;
    height:50px;
}

canvas {
    cursor: crosshair;
}

</style>
