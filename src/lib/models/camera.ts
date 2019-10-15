import { Entity, Viewport } from 'tiled-platformer-lib'
import { Box, Vector } from 'sat'

export class Camera {
    public x: number
    public y: number
    public bounds: SAT.Box
    public follow: Entity
    public middlePoint: SAT.Vector
    public magnitude = 2
    public shakeDirection = 1

    constructor (public viewport: Viewport) {
        this.resize(viewport)
        this.setDefaultMiddlePoint()
        // bindings
        this.center = this.center.bind(this) 
        this.getBounds = this.getBounds.bind(this)
        this.resize = this.resize.bind(this)
        this.setBounds = this.setBounds.bind(this)
        this.setMiddlePoint = this.setMiddlePoint.bind(this) 
        this.setDefaultMiddlePoint = this.setDefaultMiddlePoint.bind(this) 
        this.setFollow = this.setFollow.bind(this) 
        this.shake = this.shake.bind(this) 
    }

    resize (viewport: Viewport): void {
        this.viewport = viewport
    }

    center (): void {
        if (this.follow) {
            this.x = -((this.follow.x + this.follow.width / 2) - this.middlePoint.x)
            this.y = -((this.follow.y + this.follow.height / 2) - this.middlePoint.y)
        }
    }

    getBounds (): SAT.Box {
        if (!this.bounds) {
            const { width, height } = this.viewport
            this.setBounds(0, 0, width, height)
        }
        return this.bounds
    }

    setBounds (x: number, y: number, w: number, h: number): void {
        this.bounds = new Box(new Vector(x, y), w, h)
        this.center()
    }

    setDefaultMiddlePoint (): void {
        const { width, height, scale } = this.viewport
        this.setMiddlePoint(
            Math.round(width / scale) / 2,
            Math.round(height / scale) / 2
        )
    }

    setMiddlePoint (x: number, y: number): void {
        this.middlePoint = new Vector(x, y)
    }

    setFollow (follow: Entity, center = true): void {
        this.follow = follow
        center && this.center()
    }

    shake (): void {
        if (this.magnitude < 0) {
            this.magnitude = 2
            return
        }
        this.magnitude -= 0.2
        setTimeout(this.shake, 50)
    }

    update (): void {
        if (!this.follow) return
        
        const { follow, middlePoint, viewport: { width, height, scale } } = this
        const { pos: { x, y }, w, h } = this.getBounds()

        const resolutionX = width / scale
        const resolutionY = height / scale
        const moveX = ((follow.x + follow.width / 2) + this.x - middlePoint.x) / (resolutionX / 10)
        const moveY = ((follow.y + follow.height / 2) + this.y - middlePoint.y) / (resolutionY / 10)
        const followMidX = follow.x + follow.width / 2
        const followMidY = follow.y + follow.height / 2
        
        this.x -= moveX + follow.force.x
        this.y -= moveY + follow.force.y

        if (
            followMidX > x && 
            followMidX < x + w && 
            followMidY > y && 
            followMidY < y + h
        ) {
            if (this.x - resolutionX < -x - w) this.x = -x - w + resolutionX
            if (this.y - resolutionY < -y - h) this.y = -y - h + resolutionY
            if (this.x > -x) this.x = -x 
            if (this.y > -y) this.y = -y
        }
        else {
            if (this.x - resolutionX < -w) this.x = -w + resolutionX
            if (this.y - resolutionY < -h) this.y = -h + resolutionY
            if (this.x > 0) this.x = 0
            if (this.y > 0) this.y = 0
        } 

        // shake
        if (this.magnitude !== 2) {
            if (this.shakeDirection === 1) this.y += this.magnitude
            else if (this.shakeDirection === 2) this.x += this.magnitude
            else if (this.shakeDirection === 3) this.y -= this.magnitude
            else this.x -= this.magnitude
            this.shakeDirection = this.shakeDirection < 4 ? this.shakeDirection + 1 : 1
        }

        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
    }
}
