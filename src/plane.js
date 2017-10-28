import Vec3 from './vector3d.js';
import Sphere from './sphere.js';

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

    /**
     *
     * @param {Plane} plane
     * @returns {Plane}
     */
    invertOnPlane(plane) {
        const dp = Vec3.dot(this.normal, plane.normal);
        const nNormal = plane.normal.sub(this.normal.scale(2 * dp)).normalize();
        return new Plane(this.invertOnPoint(plane.p1),
                         this.invertOnPoint(plane.p2),
                         this.invertOnPoint(plane.p3),
                         nNormal);
    }

    /**
     * 
     * @param {Sphere} sphere
     * @returns {Sphere} 
     */
    invertOnSphere(sphere) {
        const nc = this.invertOnPoint(sphere.center);
        return new Sphere(nc.x, nc.y, nc.z, sphere.r);
    }

    /**
     * 
     * @param {Vec3} p
     * @returns {Vec3} 
     */
    invertOnPoint(p) {
        let pos = p.sub(this.p1);
        const dp = Vec3.dot(this.normal, pos);
        pos = pos.sub(this.normal.scale(2 * dp));
        return pos.add(this.p1);
    }
}
