import Vector from './vector'
import PolygonObject from './polygon-object'

export default class RectangleObject extends PolygonObject {
    constructor (options = {}) {
        super(options)
        this.topleft = options.topleft || new Vector(),
        this.bottomright = options.bottomright || new Vector()
    }

    syncFromTopleftBottomright () {
        this.points = [
            this.topleft, new Vector(this.bottomright.x, this.topleft.y),
            this.bottomright, new Vector(this.topleft.x, this.bottomright.y)
        ]
    }

    fill  (ctx) {
        const x = this.points[0].x, y = this.points[0].y
        ctx.rect(x, y, this.points[2].x - x, this.points[2].y - y)
    }
}
