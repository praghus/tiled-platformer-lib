import Vec2 from './vec2'
import Light from './light'
import { getRGBA, createCanvasAnd2dContext } from '../../helpers'

export default class Lamp extends Light {
    constructor (options = {}) {
        super(options)
        this.id = '_' + Math.random().toString(36).substr(2, 9)
        this.color = options.color || 'rgba(250,220,150,0.8)',
        this.radius = options.radius || 0,
        this.samples = options.samples || 1,
        this.angle = options.angle || 0,
        this.roughness = options.roughness || 0
    }

    _getHashCache  () {
        return [this.color, this.distance, this.diffuse, this.angle, this.roughness].toString()
    }

    _getGradientCache (center) {
        const hashcode = this._getHashCache()
        if (this._cacheHashcode === hashcode) {
            return this._gcache
        }
        this._cacheHashcode = hashcode
        const d = Math.round(this.distance)
        const D = d * 2
        const cache = createCanvasAnd2dContext('gc' + this.id, D, D)
        const g = cache.ctx.createRadialGradient(center.x, center.y, 0, d, d, d)
        g.addColorStop(Math.min(1, this.radius / this.distance), this.color)
        g.addColorStop(1, getRGBA(this.color, 0))
        cache.ctx.fillStyle = g
        cache.ctx.fillRect(0, 0, cache.w, cache.h)
        return this._gcache = cache
    }
    
    center  () {
        return new Vec2(
            (1 - Math.cos(this.angle) * this.roughness) * this.distance, 
            (1 + Math.sin(this.angle) * this.roughness) * this.distance
        )
    }

    bounds () {
        const orientationCenter = new Vec2(Math.cos(this.angle), -Math.sin(this.angle)).mul(this.roughness * this.distance)
        return {
            topleft: new Vec2(this.position.x + orientationCenter.x - this.distance, this.position.y + orientationCenter.y - this.distance),
            bottomright: new Vec2(this.position.x + orientationCenter.x + this.distance, this.position.y + orientationCenter.y + this.distance)
        }
    }

    mask  (ctx) {
        const c = this._getVisibleMaskCache()
        const orientationCenter = new Vec2(Math.cos(this.angle), -Math.sin(this.angle)).mul(this.roughness * this.distance)
        ctx.drawImage(c.canvas, Math.round(this.position.x + orientationCenter.x - c.w / 2), Math.round(this.position.y + orientationCenter.y - c.h / 2))
    }

    render  (ctx) {
        const center = this.center()
        const c = this._getGradientCache(center)
        ctx.drawImage(c.canvas, Math.round(this.position.x - center.x), Math.round(this.position.y - center.y))
    }

    forEachSample (f) {
        // "spiral" algorithm for spreading emit samples
        for (let s = 0; s < this.samples; ++s) {
            const a = s * (Math.PI * (3 - Math.sqrt(5)))
            const r = Math.sqrt(s / this.samples) * this.radius
            const delta = new Vec2(Math.cos(a) * r, Math.sin(a) * r)
            f(this.position.add(delta))
        }
    }
}


