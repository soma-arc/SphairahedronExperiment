import Vec3 from './vector3d.js';

export default class Plane {
    /**
     *
     * @param {Vec3} p1
     * @param {Vec3} p2
     * @param {Vec3} p3
     * @param {Vec3} normal
     */
    constructor(p1, p2, p3, normal) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.normal = normal;
    }

    toJson() {
        return {
            'normal': [this.normal.x, this.normal.y, this.normal.z],
            'p1': [this.p1.x, this.p1.y, this.p1.z],
            'p2': [this.p2.x, this.p2.y, this.p2.z],
            'p3': [this.p3.x, this.p3.y, this.p3.z]
        };
    }
}
