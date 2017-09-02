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
}
