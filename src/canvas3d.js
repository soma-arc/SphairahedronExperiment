import Canvas from './canvas.js';
import Vec2 from './vector2d.js';
import Vec3 from './vector3d.js';
import { CameraOnSphere } from './camera.js';
import { GetWebGL2Context, CreateSquareVbo, AttachShader,
         LinkProgram } from './glUtils';

const RENDER_VERTEX = require('./shaders/render.vert');
const RENDER_PRISM = require('./shaders/spheiraPrism.frag');

export default class Canvas3D extends Canvas {
    constructor(canvasId) {
        super(canvasId);
        this.pixelRatio = window.devicePixelRatio;
        this.camera = new CameraOnSphere(new Vec3(0, 0, 0), Math.PI / 3,
                                         4, new Vec3(0, 1, 0));
        this.cameraDistScale = 1.25;

        this.gl = GetWebGL2Context(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.renderProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX,
                     this.renderProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_PRISM,
                     this.renderProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderProgram,
                                                             'a_vertex');
        this.gl.enableVertexAttribArray(this.renderCanvasVAttrib);

        this.getRenderUniformLocations();

        this.mouseState = {
            isPressing: false,
            prevPosition: new Vec2(0, 0),
        };
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

    getRenderUniformLocations() {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_resolution'));
        this.camera.setUniformLocations(this.gl, this.uniLocations, this.renderProgram);
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        i = this.camera.setUniformValues(this.gl, this.uniLocations, i);
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderProgram);
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
        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.camera.prevThetaPhi = new Vec2(this.camera.theta, this.camera.phi);
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.camera.prevTarget = this.camera.target;
        }
    }

    mouseDblClickListener(event) {
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
    }

    mouseMoveListener(event) {
        event.preventDefault();
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcCanvasCoord(event.clientX, event.clientY);
        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            const prevThetaPhi = this.camera.prevThetaPhi;
            this.camera.theta = prevThetaPhi.x + (this.mouseState.prevPosition.x - mouse.x) * 0.01;
            this.camera.phi = prevThetaPhi.y - (this.mouseState.prevPosition.y - mouse.y) * 0.01;
            this.camera.update();
            this.render();
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            const d = mouse.sub(this.mouseState.prevPosition);
            const [xVec, yVec] = this.camera.getFocalXYVector(this.canvas.width,
                                                              this.canvas.height);
            this.camera.target = this.camera.prevTarget.add(xVec.scale(-d.x).add(yVec.scale(-d.y)));
            this.camera.update();
            this.render();
        }
    }
}
