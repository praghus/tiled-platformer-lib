import Light from './light'
import { createCanvasAnd2dContext } from '../../helpers'

export default class Lighting  {
    constructor (options = {}) {
        this.light = options.light || new Light()
        this.objects = options.objects || []
    }

    createCache (w, h) {
        this._cache = createCanvasAnd2dContext(w, h)
        this._castcache = createCanvasAnd2dContext(w, h)
    }

    cast  (ctxoutput) {
        const light = this.light
        const objects = this.objects
        const n = light.samples
        const c = this._castcache
        const bounds = light.bounds()
        const ctx = c.ctx
        ctx.clearRect(0, 0, c.w, c.h)
        // Draw shadows for each light sample and objects
        ctx.fillStyle = 'rgba(0,0,0,' + Math.round(100 / n) / 100 + ')'
        light.forEachSample((position) => {
            for (let o = 0; o < objects.length; ++o) {
                if (objects[o].contains(position)) {
                    ctx.fillRect(
                        bounds.topleft.x, 
                        bounds.topleft.y, 
                        bounds.bottomright.x - bounds.topleft.x, 
                        bounds.bottomright.y - bounds.topleft.y
                    )
                    return
                }
            }
            objects.map((object) => object.cast(ctx, position, bounds))
        })
        // Draw objects diffuse - the intensity of the light penetration in objects
        objects.map((object) => {
            let diffuse = object.diffuse === undefined ? 0.8 : object.diffuse
            diffuse *= light.diffuse
            ctx.fillStyle = 'rgba(0,0,0,' + (1 - diffuse) + ')'
            ctx.beginPath()
            object.path(ctx)
            ctx.fill()
        })
        ctxoutput.drawImage(c.canvas, 0, 0)
    }

    compute (w, h) {
        if (!this._cache || this._cache.w !== w || this._cache.h !== h) { 
            this.createCache(w, h) 
        }
        const ctx = this._cache.ctx
        ctx.save()
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        this.light.render(ctx)
        ctx.globalCompositeOperation = 'destination-out'
        this.cast(ctx)
        ctx.restore()
    }

    render  (ctx) {
        ctx.drawImage(this._cache.canvas, 0, 0)
    }
}
