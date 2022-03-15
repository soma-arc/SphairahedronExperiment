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
          <h4>Usage</h4>
          <ul id="usage-list">
            <li>Left Button + dragging : rotate camera / tweak parameter </li>
            <li>Right Button + dragging : move camera</li>
            <li>CtrlKey + Left dragging : move camera</li>
            <li>Wheel : zoom</li>
          </ul>
          <h4><a href="https://www.youtube.com/watch?v=vgrGWiYf-xU" target="_blank"> Introductory Video on YouTube</a></h4>
          <h4>More Info: <a href="https://sphairahedron.net" target="_blank">sphairahedron.net</a></h4>
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
    height: 100%;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
}

#topPanel {
    flex: 1;
}

#bottomPanel {
    flex: 1;
}

.subPanel {
    display: flex;
    flex-direction: row;
    flex: 1;
    height:100%;
    overflow:auto;
}

.canvasParent {
    flex: 1;
    height: 100%;
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
