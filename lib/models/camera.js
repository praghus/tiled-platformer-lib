export default class Camera {
    constructor (game) {
        this.game = game
        this.x = 0
        this.y = 0
        this.underground = false
        this.surface = null
        this.middlePoint = null
        this.magnitude = 2
        this.shakeDirection = 1
        this.shake = this.shake.bind(this)
        this.scroll = true
        this.setDefaultMiddlePoint()
    }

    setDefaultMiddlePoint () {
        if (this.game.scene) {
            const { 
                resolutionX, 
                resolutionY 
            } = this.game.scene
            
            this.setMiddlePoint(
                resolutionX / 2,
                resolutionY / 2
            )
        }
        else this.setMiddlePoint(0, 0)
    }

    setMiddlePoint (x, y) {
        this.middlePoint = { x, y }
    }

    setFollow (follow, center = true) {
        this.follow = follow
        center && this.center()
    }

    setSurfaceLevel (level) {
        this.surface = level
    }

    getSurfaceLevel () {
        if (this.game.scene && !this.surface) {
            return this.game.scene.map.height
        }
        return this.surface
    }

    update () {
        if (!this.game.scene || !this.follow) {
            return
        }
        const {
            scene: {
                resolutionX,
                resolutionY,
                map: { 
                    width, 
                    height, 
                    tilewidth, 
                    tileheight 
                }
            }
        } = this.game

        const surface = this.getSurfaceLevel()

        if (this.scroll) {
            this.y = -((this.follow.y + this.follow.height / 2) - this.middlePoint.y)
            const move = Math.round(
                ((this.follow.x + this.follow.width / 2) + this.x - this.middlePoint.x) / (resolutionX / 10)
            )
            if (move !== 0) {
                this.x -= move
            }
            if (this.follow.force.x !== 0) {
                this.x -= this.follow.force.x
            }
            if (this.x - resolutionX < -width * tilewidth) {
                this.x = (-width * tilewidth) + resolutionX
            }
            if (this.y - resolutionY < -height * tileheight) {
                this.y = (-height * tileheight) + resolutionY
            }
        }
        else {
            const xx = Math.round((this.follow.x + this.follow.width / 2) / resolutionX) - 1
            const yy = Math.round((this.follow.y - this.follow.height) / resolutionY) - 1

            this.x = -(resolutionX * xx) - resolutionX / 2
            this.y = -(resolutionY * yy) - resolutionX / 2
        }

        // above the surface
        if (Math.round((this.follow.y + (this.follow.height / 2)) / tileheight) < surface) {
            this.underground = false
            if (this.scroll && this.y - resolutionY < -surface * tileheight) {
                this.y = (-surface * tileheight) + resolutionY
            }
        }
        // under the surface
        else {
            this.underground = true
            if (this.scroll && (this.y) > -surface * tileheight) {
                this.y = (-surface * tileheight)
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
        if (this.follow) {
            this.x = -((this.follow.x + (this.follow.width / 2)) - this.middlePoint.x)
            this.y = -((this.follow.y + this.follow.height) - this.middlePoint.y)
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
