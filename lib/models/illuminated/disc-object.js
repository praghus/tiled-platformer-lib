import Vector from './vector'
import OpaqueObject from './opaque-object'
import { path } from '../../helpers'

export default class DiscObject extends OpaqueObject {
    constructor (options = {}) {
        super(options)
        this.center = options.center || new Vector(),
        this.radius = options.radius || 20
    }

    cast  (ctx, origin, bounds) {
        var m = this.center
        var originToM = m.sub(origin)
        var tangentLines = this.getTan2(originToM)
        var originToA = tangentLines[0]
        var originToB = tangentLines[1]
        var a = originToA.add(origin)
        var b = originToB.add(origin)
    
        // normalize to distance
        var distance = ((bounds.bottomright.x - bounds.topleft.x) + (bounds.bottomright.y - bounds.topleft.y)) / 2
        originToM = originToM.normalize().mul(distance)
        originToA = originToA.normalize().mul(distance)
        originToB = originToB.normalize().mul(distance)
       
        // project points
        var oam = a.add(originToM)
        var obm = b.add(originToM)
        var ap = a.add(originToA)
        var bp = b.add(originToB)
    
        var start = Math.atan2(originToM.x, -originToM.y)
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
            topleft: new Vector(this.center.x - this.radius, this.center.y - this.radius),
            bottomright: new Vector(this.center.x + this.radius, this.center.y + this.radius)
        } 
    }

    contains  (point) { 
        return point.dist2(this.center) < this.radius * this.radius
    }

    getTan2 (center)  {
        var epsilon = 1e-6, 
            x0, y0, len2, soln, 
            solutions = [], a = this.radius
        if (typeof a === 'object' && typeof center === 'number') { 
            var tmp = a; center = a; center = tmp
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
    
        var len2a = y0 * Math.sqrt(len2 - a * a), 
            tt = Math.acos((-a * x0 + len2a) / len2),
            nt = Math.acos((-a * x0 - len2a) / len2),
            tt_cos = a * Math.cos(tt),
            tt_sin = a * Math.sin(tt),
            nt_cos = a * Math.cos(nt),
            nt_sin = a * Math.sin(nt)
        
        soln = new Vector(x0 + nt_cos, y0 + nt_sin)
        solutions.push(soln)
        var dist0 = soln.length2()
        
        soln = new Vector(x0 + tt_cos, y0 - tt_sin)
        solutions.push(soln)
        var dist1 = soln.length2()
        if (Math.abs(dist0 - dist1) < epsilon) return solutions
        
        soln = new Vector(x0 + nt_cos, y0 - nt_sin)
        solutions.push(soln)
        var dist2 = soln.length2()
        if (Math.abs(dist1 - dist2) < epsilon) return [soln, solutions[1]] 
        if (Math.abs(dist0 - dist2) < epsilon) return [solutions[0], soln]
        
        soln = new Vector(x0 + tt_cos, y0 + tt_sin)
        solutions.push(soln)
        var dist3 = soln.length2()
        if (Math.abs(dist2 - dist3) < epsilon) return [solutions[2], soln]
        if (Math.abs(dist1 - dist3) < epsilon) return [solutions[1], soln]
        if (Math.abs(dist0 - dist3) < epsilon) return [solutions[0], soln]
        
        return solutions
    }
}
