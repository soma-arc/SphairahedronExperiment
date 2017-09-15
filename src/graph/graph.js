import Node from './node.js';
import Edge from './edge.js';
const assert = require('power-assert');

const TRIPLET_PATTERNS_FUNCS = {
    0: function(fixedAngles) {
        assert(fixedAngles.length === 0);
        return [
            [3, 3, 3],
            [2, 3, 6], [2, 6, 3], [3, 6, 2], [3, 2, 6], [6, 2, 3], [6, 3, 2],
            [2, 4, 4], [4, 2, 4], [4, 4, 2]
        ];
    },
    1: function(fixedAngles) {
        assert(fixedAngles.length === 1);
        const n = fixedAngles[0];
        if (n === 3) {
            return [
                [3, 3], // 3 3 3
                [2, 6], [6, 2] // 2 3 6
            ];
        } else if (n === 2) {
            return [
                [3, 6], [6, 3], // 2 3 6
                [4, 4] // 2, 4, 4
            ];
        } else if (n === 6) {
            return [
                [2, 3], [3, 2] // 2 3 6
            ];
        } else if (n === 4) {
            return [
                [2, 4], [4, 2] // 2 4 4
            ];
        } else {
            return [];
        }
    },
    2: function(fixedAngles) {
        assert(fixedAngles.length === 2);
        if (fixedAngles[0] === 3 &&
            fixedAngles[1] === 3) {
            return [
                [3] // 3 3 3
            ];
        } else if (fixedAngles.includes(3) &&
                   fixedAngles.includes(2)) {
            return [
                [6] // 2 3 6
            ];
        } else if (fixedAngles.includes(6) &&
                   fixedAngles.includes(3)) {
            return [
                [2] // 2 3 6
            ];
        } else if (fixedAngles.includes(6) &&
                   fixedAngles.includes(2)) {
            return [
                [3] // 2 3 6
            ];
        } else if (fixedAngles[0] === 4 &&
                   fixedAngles[1] === 4) {
            return [
                [2] // 2 4 4
            ];
        } else if (fixedAngles.includes(2) &&
                   fixedAngles.includes(4)) {
            return [
                [4] // 2 4 4
            ];
        } else {
            return [];
        }
    },
    3: function(fixedAngles) {
        assert(fixedAngles.length === 3);
        return [];
    }
}

const TRIPLET_VALIDATION_FUNC = function(angles) {
    assert(angles.length === 3);
    if (angles[0] === 3) {
        // [3, 3, 3], [3, 2, 6]
        return ((angles.includes(2) && angles.includes(6)) ||
                (angles[1] === 3 && angles[2] === 3));
    } else if (angles[0] === 2) {
        // [2, 3, 6], [2, 4, 4]
        return ((angles.includes(3) && angles.includes(6)) ||
                (angles[1] === 4 && angles[2] === 4));
    } else if (angles[0] === 6) {
        // [6, 2, 3]
        return (angles.includes(2) && angles.includes(3));
    } else if (angles[0] === 4) {
        // [2, 4, 4]
        return ((angles[1] === 4 && angles[2] === 2) ||
                (angles[1] === 2 && angles[2] === 4));
    }
    return false;
};

const QUARTET_PATTERNS_FUNCS = {
    0: function(fixedAngles) {
        assert(fixedAngles.length === 0);
        return [[2, 2, 2, 2]];
    },
    1: function(fixedAngles) {
        assert(fixedAngles.length === 1);
        return [[2, 2, 2]];
    },
    2: function(fixedAngles) {
        assert(fixedAngles.length === 2);
        return [[2, 2]];
    },
    3: function(fixedAngles) {
        assert(fixedAngles.length === 3);
        return [[2]];
    },
    4: function(fixedAngles) {
        assert(fixedAngles.length === 4);
        return [];
    }
}

const QUARTET_VALIDATION_FUNC = function(angles) {
    assert(angles.length === 4);
    return (angles[0] === 2 &&
            angles[1] === 2 &&
            angles[2] === 2 &&
            angles[3] === 2);
}

export default class Graph {
    constructor (jsonObj) {
        this.nodeList = [];
        this.edgeList = [];
        this.dihedralAnglesList = [];

        for (let i = 0; i < jsonObj['numVert']; i++) {
            this.nodeList.push(new Node(i));
        }

        for (const edgeIndexes of jsonObj['edges']) {
            this.edgeList.push(new Edge(this.nodeList[edgeIndexes[0]],
                                        this.nodeList[edgeIndexes[1]]));
        }

        for (const n of this.nodeList) {
            switch (n.numConnectedEdges) {
            case 3: {
                n.computePatternFunc = TRIPLET_PATTERNS_FUNCS[n.fixedAngleEdges.length];
                n.validationFunc = TRIPLET_VALIDATION_FUNC;
                break;
            }
            case 4: {
                n.computePatternFunc = QUARTET_PATTERNS_FUNCS[n.fixedAngleEdges.length];
                n.validationFunc = QUARTET_VALIDATION_FUNC;
                break;
            }
            default: {
                n.computePatternFunc = (fixedAngles) => []
                n.validationFunc = () => false
            }
            }
        }
    }

    search() {
        this.subSerch(0);
    }

    subSerch(nodeIndex) {
        const n = this.nodeList[nodeIndex];
        if (nodeIndex === this.nodeList.length - 1) {
            const angles = n.connectedEdgeFixedAngles;
            if (n.validationFunc(angles)) {
                this.recordDihedralAngles();
            } else {
                console.log('invalid');
            }
            return;
        }
        const anglesList = n.computePatternFunc(n.connectedEdgeFixedAngles);
        for (const angles of anglesList) {
            n.setAnglesToFreeEdge(angles);
            this.subSerch(nodeIndex + 1);
        }
    }

    recordDihedralAngles() {
        const angles = [];
        for (const e of this.edgeList) {
            angles.push(e.dihedralAngleDenom);
        }

        this.dihedralAnglesList.push(angles);
    }
}
