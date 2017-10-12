<template>
  <div id="rootPanel">
    <div class="subPanel" id="abovePanel">
      <div class="canvasParent">
        <canvas id="prismCanvas"
                tabIndex="1003"></canvas>
      </div>
      <div class="canvasParent">
        <canvas id="limitsetCanvas"
                tabIndex="1002"></canvas>
      </div>
    </div>
    <div class="subPanel" id="belowPanel">
      <div class="subPanel">
        <div class="canvasParent">
          <canvas id="parameterCanvas"
                  tabIndex="1001"></canvas>
        </div>
        <div class="canvasParent">
          <canvas id="spheirahedraCanvas"
                  tabIndex="1004"></canvas>
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
    export default {
        props: ['canvasHandler', 'spheirahedraHandler'],
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

#abovePanel {
    flex: 2;
}

#belowPanel {
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
