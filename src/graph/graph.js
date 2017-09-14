import Node from './node.js';
import Edge from './edge.js';

const TRIPLET_DIHEDRAL_ANGLES = [
    [3, 3, 3],
    [2, 3, 6],
    [2, 4, 4]
]

const QUARTET_DIHEDRAL_ANGLES = [
    [4, 4, 4, 4]
]

export default class Graph {
    constructor() {
        this.nodeList = [];
        this.edgeList = [];

        for (let i = 0; i < 8; i++) {
            this.nodeList.push(new Node(i));
        }

        this.edgeList.push(new Edge(this.nodeList[0],
                                    this.nodeList[1]));
        this.edgeList.push(new Edge(this.nodeList[0],
                                    this.nodeList[5]));
        this.edgeList.push(new Edge(this.nodeList[0],
                                    this.nodeList[7]));

        this.edgeList.push(new Edge(this.nodeList[1],
                                    this.nodeList[2]));
        this.edgeList.push(new Edge(this.nodeList[1],
                                    this.nodeList[4]));

        this.edgeList.push(new Edge(this.nodeList[2],
                                    this.nodeList[3]));
        this.edgeList.push(new Edge(this.nodeList[2],
                                    this.nodeList[5]));

        this.edgeList.push(new Edge(this.nodeList[3],
                                    this.nodeList[4]));
        this.edgeList.push(new Edge(this.nodeList[3],
                                    this.nodeList[6]));

        this.edgeList.push(new Edge(this.nodeList[4],
                                    this.nodeList[7]));

        this.edgeList.push(new Edge(this.nodeList[5],
                                    this.nodeList[6]));

        this.edgeList.push(new Edge(this.nodeList[6],
                                    this.nodeList[7]));
    }
}
