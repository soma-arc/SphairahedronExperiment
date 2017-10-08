<template>
  <div id="rootPanel">
    <div class="subPanel">
      <canvas id="prismCanvas"
              width="512px" height="512px"
              tabIndex="1003"></canvas>
      <canvas id="limitsetCanvas"
              width="512px" height="512px"
              tabIndex="1002"></canvas><br>
    </div>
    <div class="subPanel">
      <canvas id="parameterCanvas"
              width="256px" height="256px"
              tabIndex="1001"></canvas>
      <canvas id="spheirahedraCanvas"
              width="256px" height="256px"
              tabIndex="1004"></canvas><br>
      <div>
        Left Button + dragging : rotate camera / tweak parameter (parameter view)<br>
        Right Button + dragging : move camera<br>
        Wheel : zoom<br>
        <a href="https://github.com/soma-arc/SpheirahedronExperiment">Source code on GitHub</a><br>
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
    display: flex;
    flex-direction: column;
}

.subPanel {
    display:flex;
    flex-direction: row;
}
</style>
