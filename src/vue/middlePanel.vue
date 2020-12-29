<template>
  <div class="contentPanel">
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
    components: { CanvasPanel, ControlPanel },
}
</script>

<style>
.contentPanel {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}
</style>
