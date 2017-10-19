<template>
  <div id="rootPanel">
    <div class="subPanel" id="topPanel">
      <div class="canvasParent">
        <component v-bind:is="topLeftCanvas"/>
      </div>
      <div class="canvasParent">
        <component v-bind:is="topRightCanvas"/>
      </div>
    </div>
    <div class="subPanel" id="bottomPanel">
      <div class="subPanel">
        <div class="canvasParent">
          <component v-bind:is="bottomLeftCanvas"/>
        </div>
        <div class="canvasParent">
          <component v-bind:is="bottomRightCanvas"/>
        </div>
      </div>
      <div class="subPanel">
        <div id="infoPanel">
        Left Button + dragging : rotate camera / tweak parameter (parameter view)<br>
        Right Button + dragging : move camera<br>
        Wheel : zoom<br>
        <a href="https://github.com/soma-arc/SpheirahedronExperiment">Source code on GitHub</a><br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LimitsetCanvas from './limitsetCanvas.vue';
import PrismCanvas from './prismCanvas.vue';
import ParameterCanvas from './parameterCanvas.vue';
import SphairahedraCanvas from './sphaiahedraCanvas.vue';

export default {
    props: ['canvasHandler', 'spheirahedraHandler'],
    data: function() {
        return {
            topRightCanvas: 'limitset-canvas',
            topLeftCanvas: 'prism-canvas',
            bottomLeftCanvas: 'parameter-canvas',
            bottomRightCanvas: 'sphairahedra-canvas'
        }
    },
    components: {
        LimitsetCanvas, PrismCanvas, ParameterCanvas, SphairahedraCanvas
    },
    methods: {
        changeLayout: function(evnet) {
            const tmp = this.topRightCanvas;
            console.log(tmp);
            this.topRightCanvas = this.topLeftCanvas;
            this.topLeftCanvas = 'limitsetCanvas';
            this.canvasHandler.reRenderCanvases();
            console.log(this.canvasHandler.reRenderCanvases)
        }
    }
}
</script>

<style>
#rootPanel {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    border-style: ridge;
    border-color: gray;
}

#topPanel {
    flex: 2;
}

#bottomPanel {
    flex: 1;
}

.subPanel {
    display: flex;
    flex-direction: row;
    flex: 1;
}

.canvasParent {
    flex: 1;
    border-style: ridge;
    border-color: gray;
}

#infoPanel {
    flex: 1;
    border-style: ridge;
    border-color: gray;
    padding: 5px;
}

canvas {
    width: 100%;
    height: 100%;
}

canvas:focus {
    outline: none;
}

</style>
