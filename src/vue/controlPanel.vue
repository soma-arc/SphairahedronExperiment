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
        </select><br>
        <input type="number"
               v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.zb"
               @input="reRenderAll" style="width: 80px;"
               step="0.01">
        <label>Zb </label><br>
        <input type="number"
               v-model.number="canvasHandler.spheirahedraHandler.currentSpheirahedra.zc"
               @input="reRenderAll" style="width: 80px;"
               step="0.01">
        <label>Zc</label><br>
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
          <h4 class="uiGroupTitle">Shading</h4>
          <input type="checkbox"
                 v-model="canvasHandler.spheirahedraHandler.currentSpheirahedra.useFlashLight"
                 @change="updateRenderParameter">
          <label>FlashLight</label><br>
          <input v-model.number="canvasHandler.limitsetCanvas.metallicRoughness.x"
                 type="number" step="0.01" min="0.0" max="1.0"
                 @input="updateRenderParameter">Metallic<br>
          <input v-model.number="canvasHandler.limitsetCanvas.metallicRoughness.y"
                 type="number" step="0.01" min="0.0" max="1.0"
                 @input="updateRenderParameter">Roughness<br>
          Light Direction<br>
          <input v-model.number="canvasHandler.limitsetCanvas.lightDirection.x"
                 type="number" step="0.01"
                 @input="updateRenderParameter">X<br>
          <input v-model.number="canvasHandler.limitsetCanvas.lightDirection.y"
                 type="number" step="0.01"
                 @input="updateRenderParameter">Y<br>
          <input v-model.number="canvasHandler.limitsetCanvas.lightDirection.z"
                 type="number" step="0.01"
                 @input="updateRenderParameter">Z<br>
          Light Direction<br>
          <input v-model.number="canvasHandler.prismCanvas.lightDirection.x"
                 type="number" step="0.01"
                 @input="reRenderAll">X<br>
          <input v-model.number="canvasHandler.prismCanvas.lightDirection.y"
                 type="number" step="0.01"
                 @input="reRenderAll">Y<br>
          <input v-model.number="canvasHandler.prismCanvas.lightDirection.z"
                 type="number" step="0.01"
                 @input="reRenderAll">Z<br>
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
          <input type="checkbox"
                 v-model="canvasHandler.spheirahedraHandler.currentSpheirahedra.enableSlice"
                 @change="updateRenderParameter">
          <label>Slice</label><br>
          Slice Type
          <select @change="changeSliceType"
                  v-model="spheirahedraHandler.currentSpheirahedra.currentSliceIndex">
          <option
            v-for="(item, index) in spheirahedraHandler.currentSpheirahedra.slicePlanes">
            {{ index }}
          </option>
          </select><br>
          Slice Plane Origin<br>
          <input v-model.number="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlane.p1.x"
                 type="number" step="0.001"
                 @input="updateRenderParameter">X<br>
          <input v-model.number="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlane.p1.y"
                 type="number" step="0.001"
                 @input="updateRenderParameter">Y<br>
          <input v-model.number="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlane.p1.z"
                 type="number" step="0.001"
                 @input="updateRenderParameter">Z<br>
          Slice Plane Normal<br>
          <input type="checkbox"
                 v-model="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlaneFlipNormal"
                 @change="updateRenderParameter"> FlipNormal<br>
          <input v-model.number="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlane.normal.x"
                 type="number" step="0.01"
                 @input="updateRenderParameter">X<br>
          <input v-model.number="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlane.normal.y"
                 type="number" step="0.01"
                 @input="updateRenderParameter">Y<br>
          <input v-model.number="spheirahedraHandler.currentSpheirahedra.quasiSphereSlicePlane.normal.z"
                 type="number" step="0.01"
                 @input="updateRenderParameter">Z<br>
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
      <div class="uiGroup">
        <input v-model.number="reflectionIndex"
               type="number" min="0">ReflectionIndex
        <button @click="applyReflection">Reflection</button>
        <button @click="resetReflections">reset</button>
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
        <button @click="saveSceneParamJson">Export Parameter as Json</button><br>
      </div>
    </div>
  </div>
</template>

<script>
import Vec3 from '../vector3d.js';
import Plane from '../plane.js';
export default {
    props: ['canvasHandler', 'spheirahedraHandler'],
    data: function() {
        return {
            selectedSpheirahedron: 'cube',
            currentRoute: window.location.pathname,
            productRenderWidth: 1024,
            productRenderHeight: 1024,
            productRenderMaxSamples: 1,
            reflectionIndex: 0,
        }
    },
    methods: {
        changeSpheirahedron: function(event) {
            this.canvasHandler.changeSpheirahedron(this.selectedSpheirahedron);
        },
        changeDihedralAngleType: function(event) {
            this.canvasHandler.changeDihedralAngleType(this.spheirahedraHandler.currentDihedralAngleIndex);
        },
        changeSliceType: function(event) {
            this.canvasHandler.reRenderLimitsetCanvas();
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
        },
        saveSceneParamJson: function(event) {
            const data = this.spheirahedraHandler.currentSpheirahedra.toJson();
            data['camera'] = this.canvasHandler.limitsetCanvas.camera.toJson();
            const blob = new Blob([JSON.stringify(data, null, '    ')],
                                  { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'scene.json';
            a.click();
        },
        applyReflection: function(event) {
            if (this.spheirahedraHandler.currentSpheirahedra.planes <= this.reflectionIndex) {
                return;

            }
            const initialTile = this.spheirahedraHandler.currentSpheirahedra.planes;
            const planeIntersectionIndexes3 = [[0, 1], [0, 2], [1, 2]];
            const planeIntersectionIndexes4 = [[0, 1], [0, 3],
                                               [2, 1], [2, 3]];
            const intersections = [];
            if (initialTile.length === 3) {
                for (const indexes of planeIntersectionIndexes3) {
                    intersections.push(Plane.computeIntersection(initialTile[indexes[0]],
                                                                 initialTile[indexes[1]]));
                }
            } else if (initialTile.length === 4) {
                for (const indexes of planeIntersectionIndexes4) {
                    intersections.push(Plane.computeIntersection(initialTile[indexes[0]],
                                                                 initialTile[indexes[1]]));
                }
            }

            const bboxMin = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
            const bboxMax = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
            for (const p of intersections) {
                bboxMin[0] = Math.min(bboxMin[0], p.x * 1.1);
                // bboxMin[1] = Math.min(bboxMin[1], p.y);
                bboxMin[2] = Math.min(bboxMin[2], p.z * 1.1);

                bboxMax[0] = Math.max(bboxMax[0], p.x * 1.1);
                // bboxMax[1] = Math.max(bboxMax[1], p.y);
                bboxMax[2] = Math.max(bboxMax[2], p.z * 1.1);
            }

            const numPlanes = initialTile.length;
            const nplanes = [];
            let li = intersections;
            if (numPlanes === 3) {
                let targetPlane = initialTile[this.reflectionIndex % numPlanes];
                const reflectPlanes = [initialTile[(this.reflectionIndex + 1) % numPlanes],
                                       initialTile[(this.reflectionIndex + 2) % numPlanes]];
                nplanes.push(targetPlane);
                for (let i = 0; i < 12; i++) {
                    targetPlane = reflectPlanes[i % (numPlanes - 1)].invertOnPlane(targetPlane);
                    nplanes.push(targetPlane);
                    const newList = [];
                    for (const p of li) {
                        const np = reflectPlanes[i % (numPlanes - 1)].invertOnPoint(p);
                        bboxMin[0] = Math.min(bboxMin[0], np.x * 1.1);
                        // bboxMin[1] = Math.min(bboxMin[1], p.y);
                        bboxMin[2] = Math.min(bboxMin[2], np.z * 1.1);

                        bboxMax[0] = Math.max(bboxMax[0], np.x * 1.1);
                        // bboxMax[1] = Math.max(bboxMax[1], p.y);
                        bboxMax[2] = Math.max(bboxMax[2], np.z * 1.1);
                        newList.push(np);
                    }
                    li = newList
                }
            } else if (numPlanes === 4) {
                let targetPlane1 = initialTile[this.reflectionIndex % numPlanes];
                let targetPlane2 = initialTile[(this.reflectionIndex + 1) % numPlanes];
                const reflectPlanes = [initialTile[(this.reflectionIndex + 2) % numPlanes],
                                       initialTile[(this.reflectionIndex + 3) % numPlanes]];
                nplanes.push(targetPlane1, targetPlane2);
                for (let i = 0; i < 12; i++) {
                    targetPlane1 = reflectPlanes[i % 2].invertOnPlane(targetPlane1);
                    targetPlane2 = reflectPlanes[i % 2].invertOnPlane(targetPlane2);
                    nplanes.push(targetPlane1);
                    nplanes.push(targetPlane2);
                    const newList = [];
                    for (const p of li) {
                        const np = reflectPlanes[i % 2].invertOnPoint(p);
                        bboxMin[0] = Math.min(bboxMin[0], np.x * 1.1);
                        // bboxMin[1] = Math.min(bboxMin[1], p.y);
                        bboxMin[2] = Math.min(bboxMin[2], np.z * 1.1);

                        bboxMax[0] = Math.max(bboxMax[0], np.x * 1.1);
                        // bboxMax[1] = Math.max(bboxMax[1], p.y);
                        bboxMax[2] = Math.max(bboxMax[2], np.z * 1.1);
                        newList.push(np);
                    }
                    li = newList
                }
            }

            const filteredPlanes = [];
            for (const newPlane of nplanes) {
                let noDuplication = true;
                for (const fp of filteredPlanes) {
                    if (Vec3.dot(newPlane.normal, fp.normal) > 0.9999) {
                        noDuplication = false;
                        break;
                    }
                }
                if (noDuplication) {
                    filteredPlanes.push(newPlane);
                }
            }
            this.spheirahedraHandler.currentSpheirahedra.boundingPlanes = filteredPlanes;
            this.spheirahedraHandler.currentSpheirahedra.bboxMin = bboxMin;
            this.spheirahedraHandler.currentSpheirahedra.bboxMax = bboxMax;
            this.canvasHandler.reRenderCanvases();
        },
        resetReflections: function(event) {
            this.spheirahedraHandler.currentSpheirahedra.boundingPlanes = [];
            this.canvasHandler.reRenderCanvases();
        }
    }
}
</script>

<style>
#controlPanel {
      border-style: ridge;
      width: 300px;
      flex-basis: 300px;
      overflow: auto;
      border-color: gray;
      display: flex;
      height: 100%;
  }

  #control {
      overflow:auto;
      padding: 5px;
  }

  .uiGroup {
      border-style: ridge;
      padding: 5px;
      margin: 5px;
      overflow: auto;
  }

  .uiInnerGroup {
      border-style: ridge;
      padding: 5px;
      margin: 2px;
      overflow:auto;
  }

  .uiGroupTitle {
      margin: 5px;
  }
</style>
