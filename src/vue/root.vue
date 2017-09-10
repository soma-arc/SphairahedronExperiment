<template>
  <div id="body">
    Polyhedron:
    <select id="sphairahedraTypeBox"
            @change="changeSpheirahedron"
            v-model="selectedSpheirahedron">
      <option
        v-for="k in Object.keys(spheirahedraHandler.baseTypes)">
        {{ k }}
      </option>
    </select>
    Dihedral Angle Type:
    <select @change="changeDihedralAngleType"
            v-model="spheirahedraHandler.currentDihedralAngleIndex">
      <option
        v-for="(item, index) in spheirahedraHandler.baseTypes[selectedSpheirahedron]">
        {{ index }}
      </option>
    </select>
    <br>
    Max Iterations<input v-model="canvasHandler.limitsetCanvas.maxIterations"
                         type="number" min="0"
                         @change="updateRenderParameter"><br>
    MarchingThreshold<input v-model="canvasHandler.limitsetCanvas.marchingThreshold"
                            type="number" step="0.000001" min="0.0000001"
                            @change="updateRenderParameter">
    (fast) 0.0001 ~ 000001 (slow) are best parameters.<br>
    FudgeFactor <input v-model="canvasHandler.limitsetCanvas.fudgeFactor"
                       style="width: 80px;" type="number"
                       step="0.01" min="0.001" max="1.0"
                       @change="updateRenderParameter">
    (slow) 0.1 ~ 1.0 (fast)  Large fudgeFactor may cause artifacts.<br>
    <input type="radio" value="0"
           v-model="canvasHandler.limitsetCanvas.limitRenderingMode"
           @change="updateRenderParameter">
    <label>Terrain limit set </label>
    <input type="radio" value="1"
           v-model="canvasHandler.limitsetCanvas.limitRenderingMode"
           @change="updateRenderParameter">
    <label>Quasi-sphere from seed spheres</label>
    <input type="radio" value="2"
           v-model="canvasHandler.limitsetCanvas.limitRenderingMode"
           @change="updateRenderParameter">
    <label>Quasi-sphere from spheirahedron</label>
  </div>
</template>

<script>
    export default {
        props: ['canvasHandler', 'spheirahedraHandler'],
        data: function() {
            return {
                selectedSpheirahedron: 'cube',
                currentRoute: window.location.pathname
            }
        },
        components: {},
        methods: {
            changeSpheirahedron: function(event) {
                this.canvasHandler.changeSpheirahedron(this.selectedSpheirahedron);
            },
            changeDihedralAngleType: function(event) {
                this.canvasHandler.changeDihedralAngleType(this.spheirahedraHandler.currentDihedralAngleIndex);
            },
            updateRenderParameter: function(event) {
                this.canvasHandler.limitsetCanvas.render();
            }
        }
}

</script>

<style>
</style>
