export default class Camera {
    constructor (game) {
        this.game = game
        this.x = 0
        this.y = 0
        this.underground = false
        this.surface = null
        this.magnitude = 2
        this.shakeDirection = 1
        this.middlePoint = {
            x: 0,
            y: 0
        }
        this.shake = this.shake.bind(this)
    }

    setFollow (follow, center = true) {
        this.follow = follow
        center && this.center()
    }

    setMiddlePoint (x, y) {
        this.middlePoint = { x, y }
    }

    setSurfaceLevel (level) {
        this.surface = level
    }

    getSurfaceLevel () {
        if (this.game.world && !this.surface) {
            return this.game.world.height
        }
        return this.surface
    }

    update () {
        if (!this.game.world || !this.follow) {
            return
        }
        const { 
            world: { 
                width, 
                height, 
                spriteSize 
            }, props: { 
                viewport: { 
                    resolutionX, 
                    resolutionY 
                } 
            } 
        } = this.game

        const surface = this.getSurfaceLevel()
        const move = Math.round(((this.follow.x + this.follow.width / 2) + this.x - this.middlePoint.x) / 16)

        this.y = -((this.follow.y + this.follow.height / 2) - this.middlePoint.y)

        if (move !== 0) {
            this.x -= move
        }
        if (this.follow.force.x !== 0) {
            this.x -= this.follow.force.x
        }
        if (this.x - resolutionX < -width * spriteSize) {
            this.x = (-width * spriteSize) + resolutionX
        }
        if (this.y - resolutionY < -height * spriteSize) {
            this.y = (-height * spriteSize) + resolutionY
        }
        // above the surface
        if (Math.round((this.follow.y + (this.follow.height / 2)) / spriteSize) < surface) {
            this.underground = false
            if (this.y - resolutionY < -surface * spriteSize) {
                this.y = (-surface * spriteSize) + resolutionY
            }
        }
        // under the surface
        else {
            this.underground = true
            if ((this.y) > -surface * spriteSize) {
                this.y = (-surface * spriteSize)
            }
        }
        // shake
        if (this.magnitude !== 2) {
            if (this.shakeDirection === 1) this.y += this.magnitude
            else if (this.shakeDirection === 2) this.x += this.magnitude
            else if (this.shakeDirection === 3) this.y -= this.magnitude
            else this.x -= this.magnitude
            this.shakeDirection = this.shakeDirection < 4 ? this.shakeDirection + 1 : 1
        }

        if (this.x > 0) this.x = 0
        if (this.y > 0) this.y = 0
    }

    center () {
        const { props: { viewport } } = this.game
        if (viewport && this.follow) {
            const {resolutionX, resolutionY} = viewport
            this.x = -((this.follow.x + (this.follow.width / 2)) - (resolutionX / 2))
            this.y = -((this.follow.y + this.follow.height) - (resolutionY / 2))
        }
    }

    shake () {
        if (this.magnitude < 0) {
            this.magnitude = 2
            return
        }
        this.magnitude -= 0.2
        setTimeout(this.shake, 50)
    }
}
