import { overlap, normalize } from '../helpers'

export default class Entity {
    constructor (obj, scene) {
        this._scene = scene
        this.force = { x: 0, y: 0 }
        this.bounds = null
        this.acceleration = 0
        this.maxSpeed = 1
        this.awake = false
        this.activated = false
        this.dead = false
        this.jump = false
        this.fall = false
        this.onFloor = false
        this.solid = false
        this.vectorMask = null
        this.animation = null
        this.animFrame = 0
        this.animCount = 0
        // tmx object props
        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })
        //this.properties = obj.properties && getProperties(obj.properties)
    }

    onScreen () {
        const { world, camera, viewport } = this._scene
        const { resolutionX, resolutionY } = viewport
        const { x, y, width, height } = this
        const { spriteSize } = world
        const bounds = this.getBounds()

        return (
            x + (width || (bounds.x + bounds.width)) + spriteSize > -camera.x &&
            y + (height || (bounds.y + bounds.height)) + spriteSize > -camera.y &&
            (x + bounds.x) - spriteSize < -camera.x + resolutionX &&
            (y + bounds.y) - spriteSize < -camera.y + resolutionY
        )
    }

    animate (animation = this.animation) {
        this.animFrame = this.animFrame || 0
        this.animCount = this.animCount || 0

        if (this.animation !== animation) {
            this.animation = animation
            this.animFrame = 0
            this.animCount = 0
        }
        else if (++(this.animCount) === Math.round(60 / animation.fps)) {
            if (this.animFrame <= this.animation.frames && animation.loop) {
                this.animFrame = normalize(this.animFrame + 1, 0, this.animation.frames)
            }
            else if (this.animFrame < this.animation.frames - 1 && !animation.loop) {
                this.animFrame += 1
            }
            this.animCount = 0
        }
    }

    update(){
        // update
    }

    draw () {
        const { ctx, assets, camera } = this._scene
        if (this.onScreen()) {
            const { animation, animFrame, width, height, visible } = this
            const sprite = assets[this.asset]
            const [ posX, posY ] = [
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            ]
            if (visible && sprite) {                
                if (animation) {
                    ctx.drawImage(sprite,
                        animation.x + animFrame * animation.w, animation.y,
                        animation.w, animation.h,
                        posX, posY,
                        animation.w, animation.h
                    )
                }
                else {
                    ctx.drawImage(sprite,
                        0, 0,
                        width, height,
                        posX, posY,
                        width, height
                    )
                }
            }
        }
    }

    getBounds () {
        const { width, height } = this
        return this.bounds || {x: 0, y: 0, width, height}
    }

    getBoundingRect () {
        const {x, y, width, height} = this.getBounds()
        return {
            x: this.x + x,
            y: this.y + y,
            width, height
        }
    }

    overlapTest (obj) {
        if (!this.dead && (this.onScreen() || this.activated || this.awake) &&
            overlap(this.getBoundingRect(), obj.getBoundingRect())
        ) {
            this.collide && this.collide(obj)
            obj.collide && obj.collide(this)
        }
    }

    move () {
        const { world } = this._scene
        const { spriteSize } = world

        const reducedForceY = this.force.y < spriteSize && this.force.y || spriteSize

        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed

        this.expectedX = this.x + this.force.x
        this.expectedY = this.y + this.force.y

        const {
            x: boundsX,
            y: boundsY,
            width: boundsWidth,
            height: boundsHeight
        } = this.getBounds()

        const boundsSize = { width: boundsWidth, height: boundsHeight }

        const offsetX = this.x + boundsX
        const offsetY = this.y + boundsY

        const nextX = { x: offsetX + this.force.x, y: offsetY, ...boundsSize }
        const nextY = { x: offsetX, y: offsetY + reducedForceY, ...boundsSize }

        const PX = Math.floor((this.expectedX + boundsX) / spriteSize)
        const PY = Math.floor((this.expectedY + boundsY) / spriteSize)
        const PW = Math.floor((this.expectedX + boundsX + boundsWidth) / spriteSize)
        const PH = Math.floor((this.expectedY + boundsY + boundsHeight) / spriteSize)

        for (let y = PY; y <= PH; y++) {
            for (let x = PX; x <= PW; x++) {
                const tile = {
                    x: x * spriteSize,
                    y: y * spriteSize,
                    width: spriteSize,
                    height: spriteSize,
                    jumpThrough: false
                }
                //world.tileData(x, y) // @todo: make collision layers iteration
                if (world.isSolidArea(x, y)) { // change to isSolid function
                    const isOneWay = world.isOneWayArea(x, y)
                    if (!isOneWay && overlap(nextX, tile)) {
                        if (this.force.x < 0) {
                            this.force.x = tile.x + tile.width - offsetX
                        }
                        else if (this.force.x > 0) {
                            this.force.x = tile.x - offsetX - boundsWidth
                        }
                    }
                    if (overlap(nextY, tile)) {
                        if (this.force.y < 0 && !isOneWay) {
                            this.force.y = tile.y + tile.height - offsetY
                        }
                        else if (
                            (this.force.y > 0 && !isOneWay) ||
                            (isOneWay && this.y + this.height <= tile.y)
                        ) {
                            this.force.y = tile.y - offsetY - boundsHeight
                        }
                    }
                }
            }
        }

        this.x += this.force.x
        this.y += this.force.y

        this.onCeiling = this.expectedY < this.y
        this.onFloor = this.expectedY > this.y
        // todo: remove this
        this.onLeftEdge = !world.isSolidArea(PX, PH)
        this.onRightEdge = !world.isSolidArea(PW, PH)
    }

    kill () {
        this.dead = true
    }

    restore () {
        this.activated = false
        this.dead = false
        this.animFrame = 0
        this.animCount = 0
    }
}
