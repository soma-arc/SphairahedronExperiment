import Edge from './edge.js';
const assert = require('power-assert');

export default class Node {
    /**
     *
     * @param {Number} index
     */
    constructor(index) {
        this.index = index;

        this.fixedAngleEdges = [];
        this.freeAngleEdges = [];

        this.x = 0;
        this.y = 0;
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     */
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.arc(this.x, this.y, 100, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.stroke();
        ctx.fill();
    }

    /**
     *
     * @param {Edge} edge
     */
    addFixedAngleEdge(edge) {
        this.fixedAngleEdges.push(edge);
    }

    /**
     *
     * @param {Edge} edge
     */
    addFreeAngleEdge(edge) {
        this.freeAngleEdges.push(edge);
    }

    /**
     *
     * @returns {Number}
     */
    get numConnectedEdges() {
        return this.fixedAngleEdges.length + this.freeAngleEdges.length
    }

    /**
     *
     * @returns {[Number]}
     */
    get connectedEdgeFixedAngles() {
        const angles = [];
        for (const e of this.fixedAngleEdges) {
            angles.push(e.dihedralAngleDenom);
        }
        return angles;
    }

    /**
     *
     * @param {[Number]} angles
     */
    setAnglesToFreeEdge(angles) {
        assert(this.freeAngleEdges.length === angles.length);
        for (let i = 0; i < angles.length; i++) {
            this.freeAngleEdges[i].dihedralAngleDenom = angles[i];
        }
    }
}
