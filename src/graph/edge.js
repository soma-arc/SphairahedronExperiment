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

    draw(ctx) {
        ctx.strokeStyle = 'rgb(0, 0, 0)';

        ctx.beginPath();
        ctx.moveTo(this.n1.x, this.n1.y);
        ctx.lineTo(this.n2.x, this.n2.y);

        ctx.stroke();
    }
}
