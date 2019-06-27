import { createCanvasAnd2dContext } from '../../helpers'

export default class DarkMask  {
    constructor (options = {}) {
        this.color = options.color || 'rgba(0,0,0,0.9)'
        this.lights = options.lights || []
    }

    compute  (w, h) {
        if (!this._cache || this._cache.w !== w || this._cache.h !== h) { 
            this._cache = createCanvasAnd2dContext(w, h) 
        }
        const ctx = this._cache.ctx
        ctx.save()
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = this.color
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'destination-out'
        this.lights.map((light) => light.mask(ctx))
        ctx.restore()
    }

    render (ctx) {
        ctx.drawImage(this._cache.canvas, 0, 0)
    }
}
