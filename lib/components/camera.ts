import { Box, Vector } from 'sat'

import { Entity } from './entity'
import { Viewport } from './viewport'

export class Camera {
    public x: number
    public y: number
    public bounds: Box
    public follow: Entity
    public focusPoint: Vector

    constructor (public viewport: Viewport) {
        const { width, height, scale } = viewport
        this.resize(viewport)        
        this.setFocusPoint(
            Math.round(width / scale) / 2,
            Math.round(height / scale) / 2
        )

        this.center = this.center.bind(this) 
        this.getBounds = this.getBounds.bind(this)
        this.moveTo = this.moveTo.bind(this)
        this.resize = this.resize.bind(this)
        this.setBounds = this.setBounds.bind(this)
        this.setFocusPoint = this.setFocusPoint.bind(this) 
        this.setFollow = this.setFollow.bind(this) 
    }

    resize (viewport: Viewport): void {
        this.viewport = viewport
    }

    moveTo (x: number, y: number): void {
        this.x = -x
        this.y = -y
    }

    center (): void {
        this.follow
            ? this.moveTo(
                (this.follow.x + this.follow.width / 2) - this.focusPoint.x,
                (this.follow.y + this.follow.height / 2) - this.focusPoint.y
            )
            : this.moveTo(
                this.viewport.width / 2,
                this.viewport.height / 2
            )
    }

    getBounds (): Box {
        if (!this.bounds) {
            const { width, height } = this.viewport
            this.setBounds(0, 0, width, height)
        }
        return this.bounds
    }

    setBounds (x: number, y: number, w: number, h: number): void {
        this.bounds = new Box(new Vector(x, y), w, h)
    }

    setFocusPoint (x: number, y: number): void {
        this.focusPoint = new Vector(x, y)
    }

    setFollow (follow: Entity, center = true): void {
        this.follow = follow
        center && this.center()
    }

    update (): void {
        if (!this.follow) return
        
        const { follow, focusPoint, viewport: { width, height, scale } } = this
        const { pos: { x, y }, w, h } = this.getBounds()

        const resolutionX = width / scale
        const resolutionY = height / scale
        const moveX = ((follow.x + follow.width / 2) + this.x - focusPoint.x) / (resolutionX / 10) 
        const moveY = ((follow.y + follow.height / 2) + this.y - focusPoint.y) / (resolutionY / 10) 
        const followMidX = follow.x + follow.width / 2
        const followMidY = follow.y + follow.height / 2
        
        this.x -= Math.round(moveX + follow.force.x)
        this.y -= Math.round(moveY + follow.force.y)

        if (
            followMidX > x && 
            followMidX < x + w && 
            followMidY > y && 
            followMidY < y + h
        ) {
            if (this.x - resolutionX < -x - w) this.x = (-x - w + resolutionX) 
            if (this.y - resolutionY < -y - h) this.y = (-y - h + resolutionY) 
            if (this.x > -x) this.x = -x 
            if (this.y > -y) this.y = -y 
        }
        else {
            if (this.x - resolutionX < -w) this.x = (-w + resolutionX) 
            if (this.y - resolutionY < -h) this.y = (-h + resolutionY) 
            if (this.x > 0) this.x = 0
            if (this.y > 0) this.y = 0
        } 
    }
}
