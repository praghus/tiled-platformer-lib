import Vec2 from './vec2'
import PolygonObject from './polygon-object'

export default class RectangleObject extends PolygonObject {
    constructor (options = {}) {
        super(options)
        this.topleft = options.topleft || new Vec2(),
        this.bottomright = options.bottomright || new Vec2()
    }

    syncFromTopleftBottomright () {
        this.points = [
            this.topleft, new Vec2(this.bottomright.x, this.topleft.y),
            this.bottomright, new Vec2(this.topleft.x, this.bottomright.y)
        ]
    }

    fill  (ctx) {
        const x = this.points[0].x, y = this.points[0].y
        ctx.rect(x, y, this.points[2].x - x, this.points[2].y - y)
    }
}
