import Vector from './vector'
import { noop, createCanvasAnd2dContext } from '../../helpers'


export default class Light {
    constructor (options = {}) {
        this.position = options.position || new Vector(),
        this.distance = options.distance || 100,
        this.diffuse = options.diffuse || 0.8
    }

    mask  (ctx) {
        const c = this._getVisibleMaskCache()
        ctx.drawImage(
            c.canvas,
            Math.round(this.position.x - c.w / 2),
            Math.round(this.position.y - c.h / 2)
        )
    }

    bounds () {
        return {
            topleft: new Vector(this.position.x - this.distance, this.position.y - this.distance),
            bottomright: new Vector(this.position.x + this.distance, this.position.y + this.distance)
        }
    }

    center () {
        return new Vector(this.distance, this.distance)
    }

    forEachSample (f = noop) { 
        f(this.position) 
    }

    _getVisibleMaskCache () {
        // By default use a radial gradient based on the distance
        const d = Math.floor(this.distance * 1.4)
        const hash = '' + d
        if (this.vismaskhash !== hash) {
            this.vismaskhash = hash
            const c = this._vismaskcache = createCanvasAnd2dContext(2 * d, 2 * d)
            const g = c.ctx.createRadialGradient(d, d, 0, d, d, d)
            g.addColorStop(0, 'rgba(0,0,0,1)')
            g.addColorStop(1, 'rgba(0,0,0,0)')
            c.ctx.fillStyle = g
            c.ctx.fillRect(0, 0, c.w, c.h)
        }
        return this._vismaskcache
    }
}