//extend sat.js vector
export default class Vec2 {
    constructor (x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    copy () {
        return new Vec2(this.x, this.y)
    }

    dot (v) {
        return v.x * this.x + v.y * this.y
    }

    sub (v) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    add  (v) {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    mul (n) {
        return new Vec2(this.x * n, this.y * n)
    }
    
    inv () {
        return this.mul(-1)
    }
    
    dist2 (v) {
        const dx = this.x - v.x
        const dy = this.y - v.y
        return dx * dx + dy * dy
    }
    
    normalize () {
        const length = Math.sqrt(this.length2())
        return new Vec2(this.x / length, this.y / length)
    }
    
    length2 () {
        return this.x * this.x + this.y * this.y
    }
    
    toString () {
        return this.x + ',' + this.y
    }
    
    inBound (topleft, bottomright) {
        return (
            topleft.x < this.x && this.x < bottomright.x &&
            topleft.y < this.y && this.y < bottomright.y
        )
    }
}


