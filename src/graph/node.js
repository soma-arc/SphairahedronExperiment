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
