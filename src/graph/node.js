import Edge from './edge.js';

export default class Node {
    /**
     *
     * @param {Number} index
     */
    constructor(index) {
        this.index = index;
        this.connectedEdges = [];
        this.numFreeEdge = 0;
    }

    /**
     *
     * @param {Edge} edge
     */
    addEdge(edge) {
        this.connectedEdges.push(edge);
    }
}
