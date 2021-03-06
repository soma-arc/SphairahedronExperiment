import Node from './node.js';

export default class Edge {
    /**
     * @param {Node} n1
     * @param {Node} n2
     */
    constructor(n1, n2) {
        this.n1 = n1;
        this.n2 = n2;
        this.dihedralAngleDenom = -1;
        this.n1.addFreeAngleEdge(this);
        this.n2.addFixedAngleEdge(this);
    }
}
