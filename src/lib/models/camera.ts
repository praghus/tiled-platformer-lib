import { Scene, Entity } from 'tiled-platformer-lib'
import { Box, Vector } from 'sat'

export class Camera {
    public x: number
    public y: number
    public bounds: SAT.Box
    public follow: Entity
    public middlePoint: SAT.Vector
    public magnitude = 2
    public shakeDirection = 1

    constructor (public scene: Scene) {
        this.shake = this.shake.bind(this)
        this.setBounds = this.setBounds.bind(this)        
        this.setDefaultMiddlePoint()
    }

    center (): void {
        if (this.follow) {
            this.x = -((this.follow.x + (this.follow.width / 2)) - this.middlePoint.x)
            this.y = -((this.follow.y + this.follow.height) - this.middlePoint.y)
        }
    }

    getBounds (): SAT.Box {
        if (!this.bounds) {
            const { width, height, tilewidth, tileheight } = this.scene.map
            this.setBounds(0, 0, width * tilewidth, height * tileheight)
        }
        return this.bounds
    }

    setBounds (x: number, y: number, w: number, h: number): void {
        this.bounds = new Box(new Vector(x, y), w, h)
        this.center()
    }

    setDefaultMiddlePoint (): void {
        const { resolutionX, resolutionY } = this.scene
        this.setMiddlePoint(resolutionX / 2, resolutionY / 2)
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
        if (!this.follow) {
            return
        }
        const { resolutionX, resolutionY, map } = this.scene
        const { width, height, tilewidth, tileheight } = map

        const moveX = Math.round((
            (this.follow.x + this.follow.width / 2) + this.x - this.middlePoint.x
        ) / (resolutionX / 10))
        
        const moveY = Math.round((
            (this.follow.y + this.follow.height / 2) + this.y - this.middlePoint.y
        ) / (resolutionY / 10))

        if (moveX !== 0) this.x -= moveX
        if (moveY !== 0) this.y -= moveY
        if (this.follow.force.x !== 0) this.x -= this.follow.force.x
        if (this.follow.force.y !== 0) this.y -= this.follow.force.y

        // bounds
        const { pos: { x, y }, w, h } = this.getBounds()
        const followMidX = this.follow.x + this.follow.width / 2
        const followMidY = this.follow.y + this.follow.height / 2

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
            const mw = -width * tilewidth
            const mh = -height * tileheight
            if (this.x - resolutionX < mw) this.x = mw + resolutionX
            if (this.y - resolutionY < mh) this.y = mh + resolutionY
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
    }
}
