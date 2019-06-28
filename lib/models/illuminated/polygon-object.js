import Vec2 from './vec2'
import OpaqueObject from './opaque-object'
import { path } from '../../helpers'

export default class PolygonObject extends OpaqueObject {
    constructor (options = {}) {
        super(options)
        this.points = options.points || []
    }

    _forEachVisibleEdges (origin, bounds, f) {
        let a = this.points[this.points.length - 1]
        let b
        for (let p = 0; p < this.points.length; ++p, a = b) {
            b = this.points[p]
            if (a.inBound(bounds.topleft, bounds.bottomright)) {
                const originToA = a.sub(origin)
                const originToB = b.sub(origin)
                const aToB = b.sub(a)
                const normal = new Vec2(aToB.y, -aToB.x)
                if (normal.dot(originToA) < 0) {
                    f(a, b, originToA, originToB, aToB)
                }
            }
        }
    }

    bounds () {
        const topleft = this.points[0].copy()
        const bottomright = topleft.copy()
        for (let p = 1; p < this.points.length; ++p) {
            const point = this.points[p]
            if (point.x > bottomright.x) bottomright.x = point.x 
            if (point.y > bottomright.y) bottomright.y = point.y 
            if (point.x < topleft.x) topleft.x = point.x 
            if (point.y < topleft.y) topleft.y = point.y 
        }
        return { 
            topleft: topleft, 
            bottomright: bottomright 
        }
    }

    contains  (p) {
        const points = this.points
        const x = p.x 
        const y = p.y
        let j = points.length - 1
        let oddNodes = false
     
        for (let i = 0; i < points.length; i++) {
            if (
                (points[i].y < y && points[j].y >= y || points[j].y < y && points[i].y >= y) && 
                (points[i].x <= x || points[j].x <= x)
            ) {
                if (points[i].x + (y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < x) {
                    oddNodes = !oddNodes 
                }
            }
            j = i 
        }
        return oddNodes
    }

    path (ctx) {
        path(ctx, this.points)
    }

    cast (ctx, origin, bounds) {
        // The current implementation of projection is a bit hacky... do you have a proper solution?
        const distance = ((bounds.bottomright.x - bounds.topleft.x) + (bounds.bottomright.y - bounds.topleft.y)) / 2
        this._forEachVisibleEdges(origin, bounds, function (a, b, originToA, originToB, aToB) {
            const t = originToA.inv().dot(aToB) / aToB.length2()
            let m // m is the projected point of origin to [a, b]
            if (t < 0) {
                m = a
            }
            else if (t > 1) {
                m = b
            }
            else {
                m = a.add(aToB.mul(t)) 
            }
            let originToM = m.sub(origin)
            // normalize to distance
            originToM = originToM.normalize().mul(distance)
            originToA = originToA.normalize().mul(distance)
            originToB = originToB.normalize().mul(distance)
            // project points
            const oam = a.add(originToM)
            const obm = b.add(originToM)
            const ap = a.add(originToA)
            const bp = b.add(originToB)
            ctx.beginPath()
            path(ctx, [a, b, bp, obm, oam, ap])
            ctx.fill()
        })
    }
}
