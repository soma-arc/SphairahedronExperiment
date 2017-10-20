<template>
  <div id="controlPanel">
    <div id="control">
      <div class="uiGroup">
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
      </div>
      <div class="uiGroup">
        <h4 class="uiGroupTitle">Limit Set&nbsp;&nbsp;-&nbsp;&nbsp;Samples: {{ canvasHandler.limitsetCanvas.numSamples }} of {{ canvasHandler.limitsetCanvas.maxSamples }}</h4>
        <div class="uiInnerGroup">
          <h4 class="uiGroupTitle">Mode</h4>
          <input type="radio" value="0"
                 v-model.number="canvasHandler.spheirahedraHandler.limitRenderingMode"
                 @change="updateLimitSetShader">
          <label>Terrain Limit Set </label><br>
          <input type="radio" value="1"
                 v-model.number="canvasHandler.spheirahedraHandler.limitRenderingMode"
                 @change="updateLimitSetShader">
          <label>Limit Set from seed spheres</label><br>
          <input type="radio" value="2"
                 v-model.number="canvasHandler.spheirahedraHandler.limitRenderingMode"
                 @change="updateLimitSetShader">
          <label>Limit Set from sphairahedron</label>
        </div>
        <div class="uiInnerGroup">
          <h4 class="uiGroupTitle">Rendering Parameters</h4>
          <input v-model="canvasHandler.limitsetCanvas.maxIterations"
                 type="number" min="0" style="width: 80px;"
                 @input="updateRenderParameter">Max Iterations<br>
          <input v-model.number="canvasHandler.limitsetCanvas.maxSamples" style="width: 80px;"
                 type="number" min="0">Max Samples<br>
          <input v-model="canvasHandler.limitsetCanvas.marchingThreshold"
                 type="number" step="0.000001" min="0.0000001" style="width: 80px;"
                 @input="updateRenderParameter">MarchingThreshold<br>
          <input v-model="canvasHandler.limitsetCanvas.fudgeFactor"
                 style="width: 80px;" type="number"
                 step="0.01" min="0.001" max="1.0"
                 @input="updateRenderParameter">FudgeFactor<br>
          <input v-model="canvasHandler.limitsetCanvas.aoEps"
                 type="number" min="0" step="0.0001" style="width: 80px;"
                 @input="updateRenderParameter">AO Epsilon<br>
          <input v-model="canvasHandler.limitsetCanvas.aoIntensity"
                 type="number" step="0.0001" min="0.0000001" style="width: 80px;"
                 @input="updateRenderParameter">AO Intensity
        </div>
        <div class="uiInnerGroup">
          <h4 class="uiGroupTitle">Inversion Sphere</h4>
          <input type="checkbox"
                 v-model="canvasHandler.spheirahedraHandler.currentSpheirahedra.constrainsInversionSphere"
                 @change="updateLimitSetShader">
          <label>Constrains</label><br>
          <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.center.x"
                   type="number" step="0.01"
                   @input="reRenderAll">X<br>
          <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.center.y"
                   type="number" step="0.01"
                   @input="reRenderAll">Y<br>
          <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.center.z"
                   type="number" step="0.01"
                 @input="reRenderAll">Z<br>
          <input v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.r"
                 type="number" step="0.01"
                 @input="reRenderAll">R<br>
        </div>
        <div class="uiInnerGroup">
          <h4 class="uiGroupTitle">Camera Mode</h4>
          <input type="radio" value="0"
                 v-model.number="canvasHandler.limitsetCanvas.cameraMode"
                 @change="changeCameraMode">
          <label>Camera on Sphere</label><br>
          <input type="radio" value="1"
                 v-model.number="canvasHandler.limitsetCanvas.cameraMode"
                 @change="changeCameraMode">
          <label>Fly</label><br>
          <button @click="resetCamera">Reset Camera</button><br>
        </div>
        <div class="uiInnerGroup">
          <h4 class="uiGroupTitle">Display</h4>
          <input type="checkbox"
                 v-model="canvasHandler.limitsetCanvas.displaySpheirahedraSphere"
                 @change="updateRenderParameter">
          <label>Spheirahedra Sphere</label><br>
          <input type="checkbox"
                 v-model="canvasHandler.limitsetCanvas.displayBoundingSphere"
                 @change="updateRenderParameter">
          <label>Bounding Sphere</label><br>
          <input type="checkbox"
                 v-model="canvasHandler.limitsetCanvas.displayPrismWithLimitSet"
                 @change="updateRenderParameter">
          <label>Prism</label><br>
          <input type="checkbox"
                 v-model="canvasHandler.limitsetCanvas.castShadow"
                 @change="updateRenderParameter">
          <label>Cast Shadow</label><br>
          <input v-model="canvasHandler.limitsetCanvas.colorWeight"
                 style="width: 80px;" type="number"
                 step="0.01"
                 @change="updateRenderParameter">
          <label>Color Weight</label><br>
        </div>
      </div>
      <div class="uiGroup">
        <h4 class="uiGroupTitle">Sphairahedron</h4>
        <input type="checkbox"
               v-model="canvasHandler.spheirahedraCanvas.displaySpheirahedraSphere"
               @change="renderSpheirahedraCanvas">
        <label>Spheirahedra Sphere</label><br>
        <input type="checkbox"
               v-model="canvasHandler.spheirahedraCanvas.displayConvexSphere"
               @change="renderSpheirahedraCanvas">
        <label>Convex Sphere</label><br>
        <input type="checkbox"
               v-model="canvasHandler.spheirahedraCanvas.displayInversionSphere"
               @change="renderSpheirahedraCanvas">
        <label>Inversion Sphere</label>
      </div>
      <div class="uiGroup">
        <h4 class="uiGroupTitle">Sphairahedral Prism</h4>
        <input type="checkbox"
               v-model="canvasHandler.prismCanvas.displaySpheirahedraSphere"
               @change="renderPrismCanvas">
        <label>Sphairahedra Sphere</label><br>
        <input type="checkbox"
               v-model="canvasHandler.prismCanvas.displayInversionSphere"
               @change="renderPrismCanvas">
        <label>Inversion Sphere</label><br>
        <input type="checkbox"
               v-model="canvasHandler.prismCanvas.displayRawSpheirahedralPrism"
               @change="renderPrismCanvas">
        <label>Raw Prism</label>
      </div>
      <div id="saveGroup" class="uiGroup">
        <h4 class="uiGroupTitle">Save</h4>
        <input v-model.number="productRenderWidth"
               style="width: 80px;" type="number" min="0"> :
        <input v-model.number="productRenderHeight"
               style="width: 80px;" type="number" min="0">w:h<br>
        <input v-model.number="productRenderMaxSamples"
               style="width: 80px;" type="number" min="0">Samples<br>
        <button @click="saveLimitsetImage">Save Limit Set Image</button><br>
        <button @click="saveSphairahedralPrismImage">Save Sphairahedral Prism Image</button><br>
        <button @click="saveSphairahedronImage">Save Sphairahedron Image</button><br>
        <button @click="saveSphairahedraPrismMesh">Export Sphairahedral Prism Stl</button><br>
        <button @click="saveSphairahedronMesh">Export Sphairahedron Stl</button><br>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
        props: ['canvasHandler', 'spheirahedraHandler'],
        data: function() {
            return {
                selectedSpheirahedron: 'cube',
                currentRoute: window.location.pathname,
                productRenderWidth: 1024,
                productRenderHeight: 1024,
                productRenderMaxSamples: 1
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
                this.canvasHandler.spheirahedraHandler.currentSpheirahedra.inversionSphere.update();
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
                this.canvasHandler.limitsetCanvas.startProductRendering(this.productRenderWidth,
                                                                        this.productRenderHeight,
                                                                        this.productRenderMaxSamples,
                                                                        'limitset.png');
            },
            saveSphairahedralPrismImage: function(event) {
                this.canvasHandler.prismCanvas.saveCanvas(this.productRenderWidth,
                                                          this.productRenderHeight,
                                                          'sphairahedralPrism.png');
            },
            saveSphairahedronImage: function(event) {
                this.canvasHandler.spheirahedraCanvas.saveCanvas(this.productRenderWidth,
                                                                 this.productRenderHeight,
                                                                 'sphairahedron.png');
            },
            resetCamera: function(event) {
                this.canvasHandler.limitsetCanvas.resetCamera();
                this.canvasHandler.reRenderLimitsetCanvas();
            }
        }
    }
</script>

<style>
#controlPanel {
      border-style: ridge;
      width: 300px;
      flex-basis: 300px;
      overflow-y: scroll;
      border-color: gray;
      display: flex;
  }

  #control {
      width: 100%;
      padding: 5px;
  }

  .uiGroup {
      border-style: ridge;
      padding: 5px;
      margin: 5px;
  }

  .uiInnerGroup {
      border-style: ridge;
      padding: 5px;
      margin: 2px;
  }

  .uiGroupTitle {
      margin: 5px;
  }
</style>
