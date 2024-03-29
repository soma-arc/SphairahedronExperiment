import Canvas from './canvas.js';
import Vec2 from './vector2d.js';
import Vec3 from './vector3d.js';
import { CameraOnSphere, FlyCamera } from './camera.js';
import { GetWebGL2Context, CreateSquareVbo, AttachShader,
         LinkProgram, CreateRGBATextures, CreateRGBAImageTexture2D,
         CreateFloatTextures } from './glUtils';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_FRAGMENT = require('./shaders/render.frag');
const RENDER_FLIPPED_VERTEX = require('./shaders/renderFlipped.vert');

const BRDF_LUT = require('./img/brdfLUT.png');

export default class Canvas3D extends Canvas {
    constructor(canvasId, sphairahedronHandler) {
        super(canvasId);
        this.sphairahedronHandler = sphairahedronHandler;

        this.fudgeFactor = 0.2;
        this.marchingThreshold = 0.00001;
        this.maxIterations = 50;
        this.isRendering = false;

        this.limitRenderingMode = 0;
        this.displaySpheirahedraSphere = true;
        this.displayConvexSphere = false;
        this.displayInversionSphere = false;
        this.displayBoundingSphere = false;
        this.displayRawSpheirahedralPrism = false;
        this.castShadow = true;

        this.isKeepingSampling = false;
        this.isRenderingLowRes = false;
        this.renderTimer = undefined;
        this.isPressingCtrl = false;

        this.aoEps = 0.0968;
        this.aoIntensity = 2.0;
        this.colorWeight = 0.0;

        this.displayPrismWithLimitSet = false;

        this.lightDirection = new Vec3(-1, -1, 0).normalize();
        this.metallicRoughness = new Vec2(0.34, 0.48);
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
        this.resizeCanvas();

        //        this.spheirahedra.addUpdateListener(this.render.bind(this));
        //        this.pixelRatio = 1.0; //window.devicePixelRatio;
        this.addEventListeners();

        this.resetCamera();

        this.gl = GetWebGL2Context(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.mouseState = {
            isPressing: false,
            prevPosition: new Vec2(0, 0),
            button: -1
        };

        this.renderCanvasProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderCanvasProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                       'a_vertex');
        this.texturesFrameBuffer = this.gl.createFramebuffer();
        this.initRenderTextures();

        this.productRenderProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_FLIPPED_VERTEX,
                     this.productRenderProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.productRenderProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.productRenderProgram);
        this.productRenderVAttrib = this.gl.getAttribLocation(this.productRenderProgram,
                                                              'a_vertex');
        this.productRenderTextures = [];
        this.isProductRendering = false;
        this.productRenderResolution = new Vec2(0, 0);
        this.productRenderFramebuffer = this.gl.createFramebuffer();

        const img = new Image();
        img.src = BRDF_LUT;
        img.addEventListener('load', () => {
            this.brdfLUT = CreateRGBAImageTexture2D(this.gl, 256, 256, img);
        });
    }

    initRenderTextures() {
        this.renderTextures = CreateFloatTextures(this.gl, this.canvas.width,
                                                  this.canvas.height, 2);
        this.lowResTextures = CreateFloatTextures(this.gl,
                                                  this.canvas.width * this.lowResRatio,
                                                  this.canvas.height * this.lowResRatio, 2)
    }

    initProductRenderTextures(width, height) {
        this.productRenderTextures = CreateFloatTextures(this.gl,
                                                         width, height, 2);
        this.productRenderResultTexture = CreateRGBATextures(this.gl, width, height, 1)[0];
    }

    /**
     * Calculate screen coordinates from mouse position
     * [0, 0]x[width, height]
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcCanvasCoord(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vec2((mx - rect.left) * this.pixelRatio,
                        (my - rect.top) * this.pixelRatio);
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_accTexture'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_brdfLUT'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_textureWeight'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_numSamples'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.camera.setUniformLocations(this.gl, this.uniLocations, program);
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_fudgeFactor'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_marchingThreshold'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_maxIterations'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_limitsetRenderingType'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_displaySpheirahedraSphere'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_displayConvexSphere'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_displayInversionSphere'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_displayBoundingSphere'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_displeyRawSpheirahedralPrism'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_displayPrism'))
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_castShadow'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_colorWeight'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_ao'));
        this.uniLocations.push(this.gl.getUniformLocation(program, 'u_lightDirection'));
        this.uniLocations.push(this.gl.getUniformLocation(program, 'u_metallicRoughness'));
    }

    setRenderUniformValues(width, height, texture) {
        let i = 0;
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], 0);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.brdfLUT);
        this.gl.uniform1i(this.uniLocations[i++], 1);
        this.gl.uniform1f(this.uniLocations[i++], this.numSamples / (this.numSamples + 1));
        this.gl.uniform1f(this.uniLocations[i++], this.numSamples)

        this.gl.uniform2f(this.uniLocations[i++], width, height);
        i = this.camera.setUniformValues(this.gl, this.uniLocations, i);
        this.gl.uniform1f(this.uniLocations[i++], this.fudgeFactor);
        this.gl.uniform1f(this.uniLocations[i++], this.marchingThreshold);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        this.gl.uniform1i(this.uniLocations[i++], this.limitRenderingMode);
        this.gl.uniform1i(this.uniLocations[i++], this.displaySpheirahedraSphere);
        this.gl.uniform1i(this.uniLocations[i++], this.displayConvexSphere);
        this.gl.uniform1i(this.uniLocations[i++], this.displayInversionSphere);
        this.gl.uniform1i(this.uniLocations[i++], this.displayBoundingSphere);
        this.gl.uniform1i(this.uniLocations[i++], this.displayRawSpheirahedralPrism);
        this.gl.uniform1i(this.uniLocations[i++], this.displayPrismWithLimitSet);
        this.gl.uniform1i(this.uniLocations[i++], this.castShadow);
        this.gl.uniform1f(this.uniLocations[i++], this.colorWeight);
        this.gl.uniform2f(this.uniLocations[i++], this.aoEps, this.aoIntensity);
        const l = this.lightDirection.normalize();
        this.gl.uniform3f(this.uniLocations[i++],
                          l.x, l.y, l.z);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.metallicRoughness.x, this.metallicRoughness.y);
        this.sphairahedronHandler.setUniformValues(this.gl, this.spheirahedraUniLocations,
                                                   0, this.scale);
    }

    renderToTexture(textures, width, height) {
        this.gl.getExtension("EXT_color_buffer_float");
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.texturesFrameBuffer);
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.spheirahedraProgram);
        this.setRenderUniformValues(width, height, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
                                     this.gl.TEXTURE_2D, textures[1], 0);
        this.gl.enableVertexAttribArray(this.renderCanvasVAttrib);
        this.gl.vertexAttribPointer(this.renderCanvasVAttrib, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        textures.reverse();
    }

    renderTexturesToCanvas(textures) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderCanvasProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        const tex = this.gl.getUniformLocation(this.renderCanvasProgram, 'u_texture');
        this.gl.uniform1i(tex, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    callRender() {
        if (this.isRenderingLowRes) {
            this.renderLowRes();
        } else {
            this.render();
        }
    }

    render() {
        if (this.spheirahedraProgram === undefined ||
            this.numSamples >= this.maxSamples) return;

        this.renderToTexture(this.renderTextures,
                             this.canvas.width, this.canvas.height);
        this.renderTexturesToCanvas(this.renderTextures);
        if (this.isKeepingSampling) {
            this.numSamples++;
        }
    }

    renderProduct() {
        if (this.spheirahedraProgram === undefined) return;

        this.renderToTexture(this.productRenderTextures,
                             this.productRenderResolution.x,
                             this.productRenderResolution.y);
        this.numSamples++;

        if (this.numSamples === this.productRenderMaxSamples) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.productRenderFramebuffer);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,
                                         this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D,
                                         this.productRenderResultTexture, 0);
            this.renderFlippedTex(this.productRenderTextures,
                                  this.productRenderResolution.x,
                                  this.productRenderResolution.y);
            this.saveImage(this.gl,
                           this.productRenderResolution.x,
                           this.productRenderResolution.y,
                           this.productRenderFilename);
            this.isProductRendering = false;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }

        this.renderTexturesToCanvas(this.productRenderTextures);
    }

    mouseWheelListener(event) {
        event.preventDefault();
        this.camera.mouseWheel(event.deltaY);
        this.numSamples = 0;
        this.callRender();
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        this.mouseState.isPressing = true;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        this.mouseState.prevPosition = mouse
        this.mouseState.button = event.button;
        if (event.button === Canvas.MOUSE_BUTTON_RIGHT ||
                   (this.isPressingCtrl && event.button === Canvas.MOUSE_BUTTON_LEFT)) {
            this.camera.mouseRightDown(mouse);
        } else if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.camera.mouseLeftDown(mouse);
        }
    }

    mouseDblClickListener(event) {
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
    }

    mouseOutListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
    }

    mouseMoveListener(event) {
        event.preventDefault();
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_RIGHT ||
            (this.isPressingCtrl && event.button === Canvas.MOUSE_BUTTON_LEFT)) {
            this.camera.mouseRightMove(mouse, this.mouseState.prevPosition);
            this.isRendering = true;
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.camera.mouseLeftMove(mouse, this.mouseState.prevPosition);
            this.isRendering = true;
        }
    }

    renderLowRes() {
        if (this.spheirahedraProgram === undefined) return;
        if (this.renderTimer !== undefined) window.clearTimeout(this.renderTimer);
        this.renderToTexture(this.lowResTextures,
                             this.canvas.width * this.lowResRatio,
                             this.canvas.height * this.lowResRatio);
        this.renderTexturesToCanvas(this.lowResTextures);
        if (this.isKeepingSampling === false) {
            this.renderTimer = window.setTimeout(this.render.bind(this), 200);
        }
    }

    keydownListener(event) {
        switch (event.key) {
        case 'w': {
            if (this.camera instanceof FlyCamera) {
                this.camera.goForward();
                this.isRendering = true;
            }
            break;
        }
        case 's': {
            if (this.camera instanceof FlyCamera) {
                this.camera.goBackward();
                this.isRendering = true;
            }
            break;
        }
        case 'a': {
            if (this.camera instanceof FlyCamera) {
                this.camera.goLeft();
                this.isRendering = true;
            }
            break;
        }
        case 'd': {
            if (this.camera instanceof FlyCamera) {
                this.camera.goRight();
                this.isRendering = true;
            }
            break;
        }
        case ' ': {
            this.resetCamera();
            this.isRendering = true;
            break;
        }
        case 'Control': {
            this.isPressingCtrl = true;
            break;
        }
        }
    }

    changeToCameraOnSphere() {
        if (!(this.camera instanceof CameraOnSphere)) {
            this.cameraMode = Canvas3D.CAMERA_MODE_SPHERE;
            this.camera = new CameraOnSphere(this.camera.pos, new Vec3(0, 0, 0),
                                             Math.PI / 3,
                                             this.camera.up);
        }
    }

    changeToFlyCamera() {
        if (!(this.camera instanceof FlyCamera)) {
            this.cameraMode = Canvas3D.CAMERA_MODE_FLY;
            this.camera = new FlyCamera(this.camera.pos,
                                        this.camera.target.sub(this.camera.pos),
                                        Math.PI / 3,
                                        this.camera.up);
        }
    }

    changeCamera() {
        if (this.cameraMode === Canvas3D.CAMERA_MODE_SPHERE) {
            this.changeToCameraOnSphere();
        } else if (this.cameraMode === Canvas3D.CAMERA_MODE_FLY) {
            this.changeToFlyCamera();
        }
    }

    resetCamera() {
        this.cameraMode = Canvas3D.CAMERA_MODE_SPHERE;
        this.camera = new CameraOnSphere(new Vec3(2, 1, 0), new Vec3(0, 0, 0),
                                         Math.PI / 3,
                                         new Vec3(0, 1, 0));
    }

    keyupListener(event) {
        this.isRendering = false;
        this.isPressingCtrl = false;
    }

    renderFlippedTex(textures, width, height) {
        console.log(width);
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.productRenderProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        const tex = this.gl.getUniformLocation(this.productRenderProgram, 'u_texture');
        this.gl.uniform1i(tex, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    startProductRendering(width, height, maxSamples, filename) {
        this.isProductRendering = true;
        this.initProductRenderTextures(width, height);
        this.numSamples = 0;
        this.productRenderMaxSamples = maxSamples;
        this.productRenderResolution = new Vec2(width, height);
        this.productRenderFilename = filename;
    }

    saveCanvas(width, height, filename) {
        this.initProductRenderTextures(width, height);
        this.numSamples = 0;
        this.productRenderMaxSamples = 1;
        this.productRenderResolution = new Vec2(width, height);
        this.productRenderFilename = filename;

        this.renderProduct();
    }

    static get CAMERA_MODE_SPHERE() {
        return 0;
    }

    static get CAMERA_MODE_FLY() {
        return 1;
    }
}
