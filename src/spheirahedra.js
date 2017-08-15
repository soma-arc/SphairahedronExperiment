import Sphere from './sphere.js';
import Vec3 from './vector3d.js';

export default class Spheirahedra {
    /**
     *
     * @param {number} zb
     * @param {number} zc
     */
    constructor(zb, zc) {
        this.zb = zb;
        this.zc = zc;
        this.computeSpheres();

        this.inversionSphere = new Sphere(-this.s6.center.x,
                                          -this.s6.center.y,
                                          this.s6.center.z,
                                          this.s6.r);

        this.computeInvSpheres();

        this.computeVertexes();
        this.computeSeedSpheres();
    }

    computeSpheres() {
        const r2 = 0.5 + (this.zb * this.zc) / 3.0;
        const r4 = 0.5 + (this.zb * this.zb - this.zb * this.zc) /3.0;
        const r6 = 0.5 + (-this.zb * this.zc + this.zc * this.zc) / 3.0;
        this.s2 = new Sphere(1 - r2, 0, 0, r2);
	    this.s4 = new Sphere(-(1 - r4)/2, this.zb, Math.sqrt(3) * (1 - r4)/2, r4);
	    this.s6 = new Sphere(-(1 - r6)/2, this.zc, -Math.sqrt(3) * (1 - r6)/2, r6);
    }

    computeInvSpheres() {
        const RT_3_INV = 1.0 / Math.sqrt(3);
        this.s1inv = this.inversionSphere.invertOnPlane(new Vec3(0, 5, RT_3_INV),
                                                        new Vec3(1, 1, 0),
                                                        new Vec3(2, 2, -RT_3_INV));
        this.s2inv = this.inversionSphere.invertOnSphere(this.s2);
        this.s3inv = this.inversionSphere.invertOnPlane(new Vec3(0, 3, -RT_3_INV),
                                                        new Vec3(1, 3, 0),
                                                        new Vec3(2, 2, RT_3_INV));
        this.s4inv = this.inversionSphere.invertOnSphere(this.s4);
        this.s5inv = this.inversionSphere.invertOnPlane(new Vec3(-0.5, 0, 1),
                                                        new Vec3(-0.5, 1, 0),
                                                        new Vec3(-0.5, 2, 1));
        this.s6inv = this.inversionSphere.invertOnSphere(this.s6);
    }

    setUniformLocations(gl, uniLocations, program) {
        uniLocations.push(gl.getUniformLocation(program, 'u_iniSpheres[0].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_iniSpheres[0].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_iniSpheres[1].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_iniSpheres[1].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_iniSpheres[2].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_iniSpheres[2].r'));

        uniLocations.push(gl.getUniformLocation(program, 'u_inversionSphere.center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_inversionSphere.r'));

        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[0].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[0].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[1].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[1].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[2].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[2].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[3].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[3].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[4].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[4].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[5].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_spheirahedraSpheres[5].r'));

        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[0].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[0].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[1].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[1].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[2].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[2].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[3].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[3].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[4].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[4].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[5].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[5].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[6].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[6].r'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[7].center'));
        uniLocations.push(gl.getUniformLocation(program, 'u_seedSpheres[7].r'));
    }

    setUniformValues(gl, uniLocations, uniI) {
        gl.uniform3f(uniLocations[uniI++],
                     this.s2.center.x, this.s2.center.y, this.s2.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s2.r, this.s2.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.s4.center.x, this.s4.center.y, this.s4.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s4.r, this.s4.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.s6.center.x, this.s6.center.y, this.s6.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s6.r, this.s6.rSq);

        gl.uniform3f(uniLocations[uniI++],
                     this.inversionSphere.center.x, this.inversionSphere.center.y, this.inversionSphere.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.inversionSphere.r, this.inversionSphere.rSq);

        gl.uniform3f(uniLocations[uniI++],
                     this.s1inv.center.x, this.s1inv.center.y, this.s1inv.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s1inv.r, this.s1inv.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.s2inv.center.x, this.s2inv.center.y, this.s2inv.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s2inv.r, this.s2inv.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.s3inv.center.x, this.s3inv.center.y, this.s3inv.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s3inv.r, this.s3inv.rSq);

        gl.uniform3f(uniLocations[uniI++],
                     this.s4inv.center.x, this.s4inv.center.y, this.s4inv.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s4inv.r, this.s4inv.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.s5inv.center.x, this.s5inv.center.y, this.s5inv.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s5inv.r, this.s5inv.rSq);
        gl.uniform3f(uniLocations[uniI++],
                     this.s6inv.center.x, this.s6inv.center.y, this.s6inv.center.z);
        gl.uniform2f(uniLocations[uniI++],
                     this.s6inv.r, this.s6inv.rSq);

        for(let i = 0; i < 8 ; i++){
            gl.uniform3f(uniLocations[uniI++],
                         this.seedSpheres[i].center.x, this.seedSpheres[i].center.y, this.seedSpheres[i].center.z);
            gl.uniform2f(uniLocations[uniI++],
                         this.seedSpheres[i].r, this.seedSpheres[i].rSq);
        }
        
        return uniI;
    }

    /**
     * 
     * @param {Vec3} x
     * @param {Vec3} y
     * @param {Sphere} a
     * @param {Sphere} b
     * @param {Sphere} c
     * @returns {Sphere} 
     */
    computeSeedSphere(x, y, a, b, c) {
        const ab = b.center.sub(a.center);
        const ac = c.center.sub(a.center);
        const n = Vec3.cross(ab, ac);
        const k = y.sub(x).lengthSq() / (2 * Vec3.dot(y.sub(x), n));
        const center = x.add(n.scale(k));
        return new Sphere(center.x, center.y, center.z, Math.abs(k) * n.length());
    }

    /**
     * 
     * @param {Vec3} x
     * @param {} vertexes
     * @param {Sphere} a
     * @param {Sphere} b
     * @param {Sphere} c
     * @returns {Sphere} 
     */
    computeMinSeedSphere(x, vertexes, a, b, c) {
        let minSphere = new Sphere(0, 0, 0, 99999999999);
        for(const ov of vertexes) {
            if (Vec3.distance(x, ov) < 0.000001) {
                // x === ov
                continue;
            }
            const s = this.computeSeedSphere(x, ov, a, b, c);
            console.log(s);
            if(s.r < minSphere.r) {
                minSphere = s;
            }
        }
        return minSphere;
    }

    addSphereIfNotExists(spheres, sphere) {
        for(const s of spheres) {
            if(Math.abs(s.r, sphere.r) < 0.00001 &&
               Vec3.distance(s.center, sphere.center) < 0.00001) {
                console.log('duplicate');
                return;
            }
        }
        spheres.push(sphere);
    }

    computeSeedSpheres() {
        this.seedSpheres = [];
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[0], this.vertexes,
                                                            this.s1inv, this.s2inv, this.s3inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[1], this.vertexes,
                                                            this.s1inv, this.s4inv, this.s5inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[2], this.vertexes,
                                                            this.s3inv, this.s5inv, this.s6inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[3], this.vertexes,
                                                            this.s1inv, this.s2inv, this.s4inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[4], this.vertexes,
                                                            this.s4inv, this.s5inv, this.s6inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[5], this.vertexes,
                                                            this.s2inv, this.s3inv, this.s6inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[6], this.vertexes,
                                                            this.s2inv, this.s4inv, this.s6inv));
        this.addSphereIfNotExists(this.seedSpheres,
                                  this.computeMinSeedSphere(this.vertexes[7], this.vertexes,
                                                            this.s1inv, this.s3inv, this.s5inv));
        console.log(this.seedSpheres);
    }

    computeVertexes() {
        this.vertexes = [];
        this.vertexes.push(this.computeIdealVertex(this.s1inv, this.s2inv, this.s3inv));
        this.vertexes.push(this.computeIdealVertex(this.s1inv, this.s4inv, this.s5inv));
        this.vertexes.push(this.computeIdealVertex(this.s3inv, this.s5inv, this.s6inv));
        this.vertexes.push(this.computeIdealVertex(this.s1inv, this.s2inv, this.s4inv));
        this.vertexes.push(this.computeIdealVertex(this.s4inv, this.s5inv, this.s6inv));
        this.vertexes.push(this.computeIdealVertex(this.s2inv, this.s3inv, this.s6inv));
        this.vertexes.push(this.computeIdealVertex(this.s2inv, this.s4inv, this.s6inv));
        this.vertexes.push(this.computeIdealVertex(this.s1inv, this.s3inv, this.s5inv));
        console.log(this.vertexes);
    }
    
    computeIdealVertex(a, b, c) {
        const AB = (a.center.lengthSq() - b.center.lengthSq() - a.rSq + b.rSq) * 0.5 -
              a.center.lengthSq() + Vec3.dot(a.center, b.center);
        const AC = (a.center.lengthSq() - c.center.lengthSq() - a.rSq + c.rSq) * 0.5 -
              a.center.lengthSq() + Vec3.dot(a.center, c.center);
        const x = -a.center.lengthSq() - b.center.lengthSq() + 2 * Vec3.dot(a.center, b.center);
        const y = -a.center.lengthSq() - c.center.lengthSq() + 2 * Vec3.dot(a.center, c.center);
        const z = -a.center.lengthSq() + Vec3.dot(a.center, b.center) +
              Vec3.dot(a.center, c.center) - Vec3.dot(b.center, c.center);
        const s = (AB * y - AC * z) / (x * y - z * z);
        const t = (AC * x - AB * z) / (x * y - z * z);
        return a.center.add((b.center.sub(a.center)).scale(s)).add((c.center.sub(a.center)).scale(t));
    }
}
