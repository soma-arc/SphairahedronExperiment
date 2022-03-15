import Canvas from './canvas.js';
import Vec2 from './vector2d.js';
import { GetWebGL2Context, CreateSquareVbo, AttachShader,
         LinkProgram } from './glUtils';

export default class Canvas2D extends Canvas {
    constructor(canvasId, sphairahedronHandler) {
        super(canvasId);
        this.sphairahedronHandler = sphairahedronHandler;

        this.mouseState = {
            isPressing: false,
            prevPosition: new Vec2(0, 0),
            button: -1
        };

        this.scale = 5;
        this.scaleFactor = 1.25;
        this.translate = new Vec2(0, 0);
        this.isTweaking = false;
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
        this.resizeCanvas();
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
        this.gl = GetWebGL2Context(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.addEventListeners();
    }

    /**
     * Calculate screen coordinates from mouse position
     * scale * [-width/2, width/2]x[-height/2, height/2]
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcCanvasCoord(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vec2(this.scale * (((mx - rect.left) * this.pixelRatio) /
                                      this.canvas.height - this.canvasRatio),
                        this.scale * -(((my - rect.top) * this.pixelRatio) /
                                       this.canvas.height - 0.5));
    }

    /**
     * Calculate coordinates on scene (consider translation) from mouse position
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcSceneCoord(mx, my) {
        return this.calcCanvasCoord(mx, my).add(this.translate);
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_geometry'));
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate.x, this.translate.y, this.scale);
        this.sphairahedronHandler.setUniformValues(this.gl, this.spheirahedraUniLocations, 0, this.scale);
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
            this.scale /= this.scaleFactor;
        } else {
            this.scale *= this.scaleFactor;
        }
        this.render();
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        this.mouseState.button = event.button;
        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.sphairahedronHandler.select(mouse, this.scale);
            if (this.sphairahedronHandler.currentSpheirahedra.selectedComponentId === -1) {
                this.sphairahedronHandler.currentSpheirahedra.zb = mouse.x;
                this.sphairahedronHandler.currentSpheirahedra.zc = mouse.y;
                this.sphairahedronHandler.currentSpheirahedra.update();
                this.isTweaking = true;
            }
        }
        this.mouseState.prevPosition = mouse;
        this.mouseState.prevTranslate = this.translate;
        this.mouseState.isPressing = true;
    }

    mouseMoveListener(event) {
        // envent.button return 0 when the mouse is not pressed.
        // Thus we check if the mouse is pressed.
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            const moved = this.sphairahedronHandler.move(mouse);
            if (moved) this.isTweaking = true;
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.translate = this.translate.sub(mouse.sub(this.mouseState.prevPosition));
            this.render();
        }
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
        this.isTweaking = false;
    }

    mouseOutListener(event) {
        this.mouseState.isPressing = false;
        this.isTweaking = false;
    }

    keydownListener(event) {
        switch (event.key) {
        case ' ': {
            this.sphairahedronHandler.currentSpheirahedra.zb = 0;
            this.sphairahedronHandler.currentSpheirahedra.zc = 0;
            this.sphairahedronHandler.currentSpheirahedra.update();
            this.isTweaking = true;
        }
        }
    }

    keyupListener(event) {
        this.isTweaking = false;
    }
}
