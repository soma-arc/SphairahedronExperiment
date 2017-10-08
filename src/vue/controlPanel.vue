<template>
  <div id="controlPanel">
    Polyhedron:
    <select id="sphairahedraTypeBox"
            @change="changeSpheirahedron"
            v-model="selectedSpheirahedron">
      <option
        v-for="k in Object.keys(spheirahedraHandler.baseTypes)">
        {{ k }}
      </option>
    </select><br>
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
                         @input="updateRenderParameter">
    Max Samples<input v-model.number="canvasHandler.limitsetCanvas.maxSamples"
                      type="number" min="0">
    {{ canvasHandler.limitsetCanvas.numSamples }} / {{ canvasHandler.limitsetCanvas.maxSamples }}
    <br>
    MarchingThreshold<input v-model="canvasHandler.limitsetCanvas.marchingThreshold"
                            type="number" step="0.000001" min="0.0000001"
                            @input="updateRenderParameter">
    (fast) 0.0001 ~ 000001 (slow) are best parameters.<br>
    FudgeFactor <input v-model="canvasHandler.limitsetCanvas.fudgeFactor"
                       style="width: 80px;" type="number"
                       step="0.01" min="0.001" max="1.0"
                       @input="updateRenderParameter">
    (slow) 0.1 ~ 1.0 (fast)  Large fudgeFactor may cause artifacts.<br>
    AO Epsilon<input v-model="canvasHandler.limitsetCanvas.aoEps"
                     type="number" min="0" step="0.0001"
                     @input="updateRenderParameter">
    AO Intensity<input v-model="canvasHandler.limitsetCanvas.aoIntensity"
                       type="number" step="0.0001" min="0.0000001"
                       @input="updateRenderParameter"><br>
    Inversion Sphere<br>
    <input type="checkbox"
           v-model="canvasHandler.spheirahedraHandler.constrainsInversionSphere"
           @change="updateLimitSetShader">
    <label>Constrains Inversion Sphere</label>
    X <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.center.x"
             type="number" step="0.01"
             @input="reRenderAll">
    Y <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.center.y"
             type="number" step="0.01"
             @input="reRenderAll">
    Z <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.center.z"
             type="number" step="0.01"
             @input="reRenderAll">
    <br>
    <input type="radio" value="0"
           v-model="canvasHandler.spheirahedraHandler.limitRenderingMode"
           @change="updateLimitSetShader">
    <label>Terrain limit set </label>
    <input type="radio" value="1"
           v-model="canvasHandler.spheirahedraHandler.limitRenderingMode"
           @change="updateLimitSetShader">
    <label>Quasi-sphere from seed spheres</label>
    <input type="radio" value="2"
           v-model="canvasHandler.spheirahedraHandler.limitRenderingMode"
           @change="updateLimitSetShader">
    <label>Quasi-sphere from spheirahedron</label><br>
    Camera Mode:
    <input type="radio" value="0"
           v-model.number="canvasHandler.limitsetCanvas.cameraMode"
           @change="changeCameraMode">
    <label>Camera on Sphere</label>
    <input type="radio" value="1"
           v-model.number="canvasHandler.limitsetCanvas.cameraMode"
           @change="changeCameraMode">
    <label>Fly</label>
    <br>
    Display Limit Set:<br>
    <input type="checkbox"
           v-model="canvasHandler.limitsetCanvas.displaySpheirahedraSphere"
           @change="updateRenderParameter">
    <label>Spheirahedra Sphere</label>
    <input type="checkbox"
           v-model="canvasHandler.limitsetCanvas.displayBoundingSphere"
           @change="updateRenderParameter">
    <label>Bounding Sphere</label>
    <input type="checkbox"
           v-model="canvasHandler.limitsetCanvas.castShadow"
           @change="updateRenderParameter">
    <label>Cast Shadow</label>
    <button @click="saveLimitsetImage">Save Image</button>
    <br>

    Display Spheirahedron:<br>
    <input type="checkbox"
           v-model="canvasHandler.spheirahedraCanvas.displaySpheirahedraSphere"
           @change="renderSpheirahedraCanvas">
    <label>Spheirahedra Sphere</label>
    <input type="checkbox"
           v-model="canvasHandler.spheirahedraCanvas.displayConvexSphere"
           @change="renderSpheirahedraCanvas">
    <label>Convex Sphere</label>
    <input type="checkbox"
           v-model="canvasHandler.spheirahedraCanvas.displayInversionSphere"
           @change="renderSpheirahedraCanvas">
    <label>Inversion Sphere</label><br>
    Display Spheirahedral Prism:<br>
    <input type="checkbox"
           v-model="canvasHandler.prismCanvas.displaySpheirahedraSphere"
           @change="renderPrismCanvas">
    <label>Spheirahedra Sphere</label>
    <input type="checkbox"
           v-model="canvasHandler.prismCanvas.displayInversionSphere"
           @change="renderPrismCanvas">
    <label>Inversion Sphere</label>
    <input type="checkbox"
           v-model="canvasHandler.prismCanvas.displayRawSpheirahedralPrism"
           @change="renderPrismCanvas">
    <label>Display Raw Prism</label>
    <br>
    <button @click="saveSphairahedraPrismMesh">Export Sphairahedral Prism</button>
    <button @click="saveSphairahedronMesh">Export Sphairahedron</button><br>
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
#controlPanel {
  width: 300px;
}
</style>
