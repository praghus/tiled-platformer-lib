export default class Vector {
    constructor (x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    copy () {
        return new Vector(this.x, this.y)
    }

    dot (v) {
        return v.x * this.x + v.y * this.y
    }

    sub (v) {
        return new Vector(this.x - v.x, this.y - v.y)
    }

    add  (v) {
        return new Vector(this.x + v.x, this.y + v.y)
    }

    mul (n) {
        return new Vector(this.x * n, this.y * n)
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
        return new Vector(this.x / length, this.y / length)
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


