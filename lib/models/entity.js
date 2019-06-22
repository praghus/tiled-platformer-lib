import { Box, Vector } from 'sat'
import { TILE_TYPE } from '../constants'
import { getPerformance, isValidArray, overlap, normalize } from '../helpers'

export default class Entity {
    constructor (obj, game) {
        this.game = game
        this.bounds = null
        this.speed = 0
        this.maxSpeed = 1
        this.activated = false
        this.dead = false 
        this.onFloor = false
        this.solid = false
        this.vectorMask = null
        this.animation = null
        this.animFrame = 0
        this.force = { 
            x: 0, 
            y: 0 
        }
        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })
        this.frameStart = getPerformance()
        this.then = getPerformance()
        
        this.setBoundingBox(0, 0, this.width, this.height)
    }

    setBoundingBox (x, y, w, h) {
        this.bounds = new Box(new Vector(x, y), w, h)
    }

    getBoundingRect () {
        const {pos: {x, y}, w: width, h: height} = this.bounds
        return {
            x: this.x + x,
            y: this.y + y,
            width, 
            height
        }
    }

    onScreen () {
        const { 
            camera, 
            world: { spriteSize }, 
            props: { 
                viewport: { resolutionX, resolutionY } 
            } 
        } = this.game
        const { x, y, width, height } = this
        return (
            x + width  + spriteSize > -camera.x &&
            y + height + spriteSize > -camera.y &&
            x - spriteSize < -camera.x + resolutionX &&
            y - spriteSize < -camera.y + resolutionY
        )
    }

    animate (animation = this.animation) {
        this.animFrame = this.animFrame || 0
        
        this.frameStart = getPerformance()

        if (this.animation !== animation) {
            this.animation = animation
            this.animFrame = 0
        }
        
        const duration = animation.strip 
            ? animation.strip.duration
            : isValidArray(animation.frames) && animation.frames[this.animFrame][2]

        const framesCount = animation.strip 
            ? animation.strip.frames
            : isValidArray(animation.frames) && animation.frames.length         
        
        if (this.frameStart - this.then > duration) {
            if (this.animFrame <= framesCount && animation.loop) {
                this.animFrame = normalize(this.animFrame + 1, 0, framesCount)
            }
            else if (this.animFrame < framesCount - 1 && !animation.loop) {
                this.animFrame += 1
            }
            this.then = getPerformance()
        }
    }

    update () {
        // update
    }

    draw () {
        const { ctx, camera, world, props: { assets } } = this.game
        if (this.onScreen()) {
            const { 
                animation, 
                animFrame, 
                gid,
                width, 
                height, 
                visible 
            } = this
            const sprite = assets[this.asset] 
            const [ posX, posY ] = [
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            ]
            if (visible) {                
                if (animation) {
                    const { frames, strip } = animation
                    const x = strip 
                        ? strip.x + animFrame * animation.width
                        : isValidArray(frames) && frames[animFrame][0] 
                    const y = strip 
                        ? strip.y
                        : isValidArray(frames) && frames[animFrame][1] 
                    animation && ctx.drawImage(sprite,
                        x, y,
                        animation.width, animation.height,
                        posX, posY,
                        animation.width, animation.height
                    )
                }
                else if (gid) {
                    const tile = world.createTile(gid)
                    tile.draw(ctx, posX, posY)
                }
                else {
                    ctx.drawImage(sprite, 0, 0, width, height, posX, posY, width, height)
                }
            }
        }
    }

    overlapTest (obj) {
        if (!this.dead && (this.onScreen() || this.activated) &&
            overlap(this.getBoundingRect(), obj.getBoundingRect())
        ) {
            this.collide && this.collide(obj)
            obj.collide && obj.collide(this)
        }
    }

    move () {
        const { world } = this.game
        const { spriteSize } = world

        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed
        if (this.force.y > 12) this.force.y = 12

        this.expectedX = this.x + this.force.x
        this.expectedY = this.y + this.force.y

        if (this.expectedX < 0) this.force.x = 0
        if (this.expectedY < 0) this.force.y = 0

        const {
            pos: {x: boundsX, y: boundsY},
            w: boundsWidth,
            h: boundsHeight
        } = this.bounds

        const boundsSize = { width: boundsWidth, height: boundsHeight }

        const offsetX = this.x + boundsX
        const offsetY = this.y + boundsY

        const nextX = { x: offsetX + this.force.x, y: offsetY, ...boundsSize }
        const nextY = { x: offsetX, y: offsetY + this.force.y, ...boundsSize }

        const PX = Math.floor((this.expectedX + boundsX) / spriteSize)
        const PY = Math.floor((this.expectedY + boundsY) / spriteSize)
        const PW = Math.floor((this.expectedX + boundsX + boundsWidth) / spriteSize)
        const PH = Math.floor((this.expectedY + boundsY + boundsHeight) / spriteSize)

        for (let y = PY; y <= PH; y++) {
            for (let x = PX; x <= PW; x++) {
                world.getTilledCollisionLayers().map((layer) => {
                    const t = layer.data[x][y]                    
                    if (world.isSolidTile(t)) {
                        const td = world.tiles[t]
                        const isOneWay = td.type === TILE_TYPE.ONE_WAY

                        if (td.collisionLayer) {
                            // console.info(td)
                            const cc2 = td.collide(new Box(new Vector(
                                nextX.x - (x * td.width),
                                nextX.y - (y * td.height)
                            ), boundsWidth, boundsHeight).toPolygon())
     
                            if (cc2) {
                                if (!(isOneWay && this.force.y < 0) && Math.abs(cc2.overlapN.y) > 0) {
                                    this.y += parseFloat(cc2.overlapV.y) // @todo: find a better way
                                    this.jump = false
                                    this.force.y += this.force.y >= 0 
                                        ? -this.force.y
                                        : parseFloat(cc2.overlapV.y)
                                }
                                else if (this.force.x !== 0) {
                                    this.force.x += cc2.overlapV.x
                                }
                            }
                        }
                        else {
                            const tile = {
                                x: x * spriteSize,
                                y: y * spriteSize,
                                width: spriteSize,
                                height: spriteSize
                            }
                            if (this.force.x !== 0 && !isOneWay && overlap(nextX, tile)) {
                                this.force.x = this.force.x < 0
                                    ? tile.x + tile.width - offsetX
                                    : tile.x - offsetX - boundsWidth
                            }

                            if (overlap(nextY, tile)) {
                                if (this.force.y !== 0 && !isOneWay) {
                                    this.force.y = this.force.y < 0 
                                        ? tile.y + tile.height - offsetY
                                        : tile.y - offsetY - boundsHeight
                                }
                                else if (isOneWay && this.force.y < 0 && this.y + this.height <= tile.y) {
                                    this.force.y = tile.y - offsetY - boundsHeight
                                }
                            }
                        }
                    }
                })
            }
        }

        this.x += this.force.x
        this.y += this.force.y
  
        this.onCeiling = this.expectedY < this.y
        this.onFloor = this.expectedY > this.y
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
    }
}
