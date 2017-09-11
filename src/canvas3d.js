import Canvas from './canvas.js';
import Vec2 from './vector2d.js';
import Vec3 from './vector3d.js';
import { CameraOnSphere } from './camera.js';
import { GetWebGL2Context, CreateSquareVbo, AttachShader,
         LinkProgram } from './glUtils';

const RENDER_FRAGMENT = require('./shaders/render.frag');
const RENDER_VERTEX = require('./shaders/render.vert');

export default class Canvas3D extends Canvas {
    constructor(canvasId, spheirahedra) {
        super(canvasId);
        this.spheirahedra = spheirahedra;
//        this.spheirahedra.addUpdateListener(this.render.bind(this));
        this.pixelRatio = 1.;//window.devicePixelRatio;
        this.camera = new CameraOnSphere(new Vec3(0, 0, 0), Math.PI / 3,
                                         1, new Vec3(0, 1, 0));
        this.cameraDistScale = 1.25;

        this.gl = GetWebGL2Context(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.mouseState = {
            isPressing: false,
            prevPosition: new Vec2(0, 0),
            button: -1
        };

        this.fudgeFactor = 0.2;
        this.marchingThreshold = 0.00001;
        this.maxIterations = 50;
        this.isRendering = false;

        this.limitRenderingMode = 0;
        this.displaySpheirahedraSphere = true;
        this.displayConvexSphere = false;
        this.displayInversionSphere = false;
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
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        i = this.camera.setUniformValues(this.gl, this.uniLocations, i);
        this.gl.uniform1f(this.uniLocations[i++], this.fudgeFactor);
        this.gl.uniform1f(this.uniLocations[i++], this.marchingThreshold);
        this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        this.gl.uniform1i(this.uniLocations[i++], this.limitRenderingMode);
        this.gl.uniform1i(this.uniLocations[i++], this.displaySpheirahedraSphere);
        this.gl.uniform1i(this.uniLocations[i++], this.displayConvexSphere);
        this.gl.uniform1i(this.uniLocations[i++], this.displayInversionSphere);

        this.spheirahedra.setUniformValues(this.gl, this.spheirahedraUniLocations,
                                           0, this.scale);
    }

    render() {
        if (this.spheirahedraProgram === undefined) return;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.spheirahedraProgram);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderCanvasVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.setRenderUniformValues(this.canvas.width, this.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    mouseWheelListener(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.camera.cameraDistance /= this.cameraDistScale;
        } else {
            this.camera.cameraDistance *= this.cameraDistScale;
        }
        this.camera.update();
        this.numSamples = 0;
        this.render();
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.mouseState.isPressing = true;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        this.mouseState.prevPosition = mouse
        this.mouseState.button = event.button;
        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.camera.prevThetaPhi = new Vec2(this.camera.theta,
                                                this.camera.phi);
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.camera.prevTarget = this.camera.target;
        }
    }

    mouseDblClickListener(event) {
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
        this.isRendering = false;
    }

    mouseMoveListener(event) {
        event.preventDefault();
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            const prevThetaPhi = this.camera.prevThetaPhi;
            this.camera.theta = prevThetaPhi.x + (this.mouseState.prevPosition.x - mouse.x) * 0.01;
            this.camera.phi = prevThetaPhi.y - (this.mouseState.prevPosition.y - mouse.y) * 0.01;
            this.camera.update();
            this.isRendering = true;
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_RIGHT) {
            const d = mouse.sub(this.mouseState.prevPosition);
            const [xVec, yVec] = this.camera.getFocalXYVector(this.canvas.width,
                                                              this.canvas.height);
            this.camera.target = this.camera.prevTarget.add(xVec.scale(-d.x).add(yVec.scale(-d.y)).scale(0.005));
            this.camera.update();
            this.isRendering = true;
        }
    }
}
