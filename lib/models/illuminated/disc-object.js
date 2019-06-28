import Vec2 from './vec2'
import OpaqueObject from './opaque-object'
import { path } from '../../helpers'

export default class DiscObject extends OpaqueObject {
    constructor (options = {}) {
        super(options)
        this.center = options.center || new Vec2(),
        this.radius = options.radius || 20
    }

    cast  (ctx, origin, bounds) {
        const m = this.center
        let originToM = m.sub(origin)
        const tangentLines = this.getTan2(this.radius, originToM)
        let originToA = tangentLines[0]
        let originToB = tangentLines[1]
        const a = originToA.add(origin)
        const b = originToB.add(origin)
    
        // normalize to distance
        const distance = ((bounds.bottomright.x - bounds.topleft.x) + (bounds.bottomright.y - bounds.topleft.y)) / 2
        
        originToM = originToM.normalize().mul(distance)
        originToA = originToA.normalize().mul(distance)
        originToB = originToB.normalize().mul(distance)
        
        // project points
        const oam = a.add(originToM)
        const obm = b.add(originToM)
        const ap = a.add(originToA)
        const bp = b.add(originToB)
    
        const start = Math.atan2(originToM.x, -originToM.y)
        ctx.beginPath()
        path(ctx, [b, bp, obm, oam, ap, a], true)
        ctx.arc(m.x, m.y, this.radius, start, start + Math.PI)
        ctx.fill()
    }

    path (ctx) {
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI)
    }

    bounds  () { 
        return { 
            topleft: new Vec2(this.center.x - this.radius, this.center.y - this.radius),
            bottomright: new Vec2(this.center.x + this.radius, this.center.y + this.radius)
        } 
    }

    contains  (point) { 
        return point.dist2(this.center) < this.radius * this.radius
    }

    getTan2 (radius, center) {
        const epsilon = this.epsilon || 1e-6
        
        let x0
        let y0 
        let len2
        let soln
        const solutions = [] 
            
        const a = radius
        if (typeof a === 'object' && typeof center === 'number') { 
            const tmp = a 
            center = a
            center = tmp // swap
        }
        if (typeof center === 'number') {
            x0 = center
            y0 = arguments[2]
            len2 = x0 * x0 + y0 * y0
        }
        else {
            x0 = center.x
            y0 = center.y
            len2 = center.length2()
        }
        // t = +/- Math.acos( (-a*x0 +/- y0 * Math.sqrt(x0*x0 + y0*y0 - a*a))/(x0*x0 + y0*y) );
        const len2a = y0 * Math.sqrt(len2 - a * a)
        const tt = Math.acos((-a * x0 + len2a) / len2)
        const nt = Math.acos((-a * x0 - len2a) / len2)
        const tt_cos = a * Math.cos(tt)
        const tt_sin = a * Math.sin(tt)
        const nt_cos = a * Math.cos(nt)
        const nt_sin = a * Math.sin(nt)
        
        // Note: cos(-t) == cos(t) and sin(-t) == -sin(t) for all t, so find
        // x0 + a*cos(t), y0 +/- a*sin(t)
        // Solutions have equal lengths
        soln = new Vec2(x0 + nt_cos, y0 + nt_sin)
        solutions.push(soln)
        const dist0 = soln.length2()
        
        soln = new Vec2(x0 + tt_cos, y0 - tt_sin)
        solutions.push(soln)
        const dist1 = soln.length2()
        if (Math.abs(dist0 - dist1) < epsilon) return solutions
        
        soln = new Vec2(x0 + nt_cos, y0 - nt_sin)
        solutions.push(soln)
        const dist2 = soln.length2()
        // Changed order so no strange X of light inside the circle. Could also sort results.
        if (Math.abs(dist1 - dist2) < epsilon) return [soln, solutions[1]] 
        if (Math.abs(dist0 - dist2) < epsilon) return [solutions[0], soln]
        
        soln = new Vec2(x0 + tt_cos, y0 + tt_sin)
        solutions.push(soln)
        const dist3 = soln.length2()
        if (Math.abs(dist2 - dist3) < epsilon) return [solutions[2], soln]
        if (Math.abs(dist1 - dist3) < epsilon) return [solutions[1], soln]
        if (Math.abs(dist0 - dist3) < epsilon) return [solutions[0], soln]
        
        // return all 4 solutions if no matching vector lengths found.
        return solutions
    }
}
