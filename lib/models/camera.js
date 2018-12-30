export default class Camera {
    constructor (scene) {
        this._scene = scene
        this.x = 0
        this.y = 0
        this.underground = false
        this.magnitude = 2
        this.shakeDirection = 1
        this.shake = this.shake.bind(this)
    }

    setFollow (follow, center = true) {
        this.follow = follow
        center && this.center()
    }

    update () {
        const { world, viewport } = this._scene
        const { resolutionX, resolutionY } = viewport
        const { spriteSize, surface } = world

        this.y = -((this.follow.y + this.follow.height / 2) - (resolutionY / 2))

        if ((this.follow.x + this.follow.width / 2) + this.x > resolutionX / 2) {
            this.x -= this.follow.force.x > 0 ? this.follow.force.x : 0.5
        }
        if ((this.follow.x + this.follow.width / 2) + this.x < resolutionX / 2) {
            this.x -= this.follow.force.x < 0 ? this.follow.force.x : -0.5
        }
        if (this.x - resolutionX < -world.width * spriteSize) {
            this.x = (-world.width * spriteSize) + resolutionX
        }
        if (this.y - resolutionY < -world.height * spriteSize) {
            this.y = (-world.height * spriteSize) + resolutionY
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
        const { viewport } = this._scene
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
