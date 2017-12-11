<template>
  <div id="rootPanel">
    <div class="subPanel" id="topPanel">
      <div class="canvasParent">
        <keep-alive>
          <component v-bind:is="canvasHandler.topLeftCanvas"/>
        </keep-alive>
      </div>
      <div class="canvasParent">
        <component v-bind:is="canvasHandler.topRightCanvas"/>
      </div>
    </div>
    <div class="subPanel" id="bottomPanel">
      <div class="subPanel">
        <div class="canvasParent">
          <keep-alive>
              <component v-bind:is="canvasHandler.bottomLeftCanvas"/>
            </keep-alive>
        </div>
        <div class="canvasParent">
            <component v-bind:is="canvasHandler.bottomRightCanvas"/>
        </div>
      </div>
      <div class="subPanel">
        <div id="infoPanel">
          <h3>Sphairahedron-based Fractal Renderer</h3>
          <h4>Usage</h4>
          <ul id="usage-list">
            <li>Left Button + dragging : rotate camera / tweak parameter </li>
            <li>Right Button + dragging : move camera</li>
            <li>Wheel : zoom</li>
          </ul>
          <a href="https://github.com/soma-arc/SpheirahedronExperiment"
             target="_blank">
            <img src="../img/GitHub-Mark-32px.png" width="32px"/>
          </a>
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
    components: {
        LimitsetCanvas, PrismCanvas, ParameterCanvas, SphairahedraCanvas
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

.infoPanel {
    border: 5px;
}

h4 {
    margin: 0;
    padding: 5px;
}

h3 {
    margin: 0;
    padding: 5px;
}

#usage-list {
    margin: 0;
}

img {
    padding: 5px;
}

</style>
