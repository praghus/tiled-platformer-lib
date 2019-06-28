import { Box, Response, Vector, Polygon, testPolygonPolygon } from 'sat'
import { getPerformance, isValidArray, normalize } from '../helpers'
import { TILE_TYPE } from '../constants'

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
        this.shadowCaster = false
        this.vectorMask = null
        this.animation = null
        this.collisionLayers = null
        this.states = null
        this.animFrame = 0
        this.force = new Vector(0, 0)
        this.initialPosition = new Vector(obj.x, obj.y)
        this.frameStart = getPerformance()
        this.then = getPerformance()

        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })
    }

    setState (state) {
        if (isValidArray(this.states) && this.states.indexOf(state) !== -1) {
            this.state = state
        }
    }

    setBoundingBox (x, y, w, h) {
        this.bounds = new Box(new Vector(x, y), w, h).toPolygon()
    }

    setBoundingPolygon (x, y, points) {
        this.bounds = new Polygon(new Vector(x, y), points.map((v) => new Vector(v[0], v[1])))
    }

    getTranslatedBounds (x = this.x, y = this.y) {
        if (this.bounds) {
            const { points, pos } = this.bounds
            return new Polygon(new Vector(pos.x + x, pos.y + y), points)
        }         
        return new Box(new Vector(x, y), this.width, this.height).toPolygon()
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
            x + width + spriteSize > -camera.x &&
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

    draw () {
        if (this.onScreen() && this.visible) {
            const { ctx, camera, world, props: { assets } } = this.game
            const { animation, animFrame, gid, width, height } = this
            const sprite = assets[this.asset]
            const [ posX, posY ] = [
                this.x + camera.x,
                this.y + camera.y
            ]
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
                world.createTile(gid).draw(ctx, posX, posY)
            }
            else if (sprite) {
                ctx.drawImage(sprite, 0, 0, width, height, posX, posY, width, height)
            }
        }
    }

    collide (/*obj, response*/) {
        // if (obj.visible && obj.properties && obj.properties.solid) {
        // //     obj.force.x += force.x
        // //     obj.force.y += force.y
        //     this.force.x -= force.x
        //     this.force.y -= force.y
        // }
    }

    overlapTest (obj) {
        const response = new Response()
        if (!this.dead && (this.onScreen() || this.activated) && testPolygonPolygon(
            this.getTranslatedBounds(), obj.getTranslatedBounds(), response
        )) {
            this.collide(obj, response)
            obj.collide(this, response)
        }
    }

    move () {
        const { world } = this.game

        if (!this.force.x && !this.force.y) return 
        // consider some slowing down solution
        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed
        //if (this.force.y > spriteSize / 2) this.force.y = spriteSize / 2
        if (this.x + this.force.x < 0) this.force.x = 0
        if (this.y + this.force.y < 0) this.force.y = 0

        this.expectedX = this.x + this.force.x
        this.expectedY = this.y + this.force.y

        const PX = Math.floor((this.x) / world.spriteSize)
        const PY = Math.floor((this.y) / world.spriteSize)
        const PW = Math.floor((this.expectedX + this.width) / world.spriteSize)
        const PH = Math.floor((this.expectedY + this.height) / world.spriteSize)

        if (isValidArray(this.collisionLayers)) {
            this.collisionLayers.map((layer) => {
                for (let y = PY; y <= PH; y++) {
                    for (let x = PX; x <= PW; x++) {
                        const t = world.getTile(x, y, layer)
                        if (world.isSolidTile(t)) {
                            const td = world.tiles[t]
                            const tileX = x * td.width
                            const tileY = y * td.height
                            const isOneWay = td.type === TILE_TYPE.ONE_WAY
                            const jumpThrough = !(isOneWay && this.force.y < 0 && !this.onFloor)
                            const ccY = td.collide(this.getTranslatedBounds(
                                this.x - tileX, this.expectedY - tileY
                            ))
                            const ccX = td.collide(this.getTranslatedBounds(
                                this.expectedX - tileX, this.y - tileY
                            ))
                            if (ccX) {
                                if (Math.abs(ccX.overlapV.y) && jumpThrough) {
                                    this.force.y += ccX.overlapV.y
                                }
                                else if (this.force.x !== 0 && !isOneWay) {
                                    this.force.x += ccX.overlapV.x
                                }
                            }
                            if (ccY && this.force.y !== 0 && jumpThrough) {
                                this.force.y += ccY.overlapV.y
                            }
                        }
                    }
                }
            })
            this.onLeftEdge = !world.isSolidArea(PX, PH, this.collisionLayers)
            this.onRightEdge = !world.isSolidArea(PW, PH, this.collisionLayers)
        }

        this.x += this.force.x
        this.y += this.force.y
        this.onFloor = this.y < this.expectedY
        this.onCeiling = this.y > this.expectedY

        // if (this.onFloor) this.force.y = 0
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
