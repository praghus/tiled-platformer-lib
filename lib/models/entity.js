import Sprite from './sprite'
import { Vec2 } from './illuminated'
import { Box, Polygon, Response, Vector, testPolygonPolygon } from 'sat'
import { createDiscObject, createPolygonObject, isValidArray } from '../helpers'

export default class Entity {
    constructor (obj, game) {        
        this.activated = false
        this.bounds = null
        this.collisionLayers = null
        this.dead = false
        this.force = new Vector(0, 0)
        this.game = game
        this.initialPosition = new Vector(obj.x, obj.y)
        this.maxSpeed = 1
        this.onFloor = false
        this.shadowCaster = false
        this.solid = false
        this.speed = 0
        this.states = null
        
        this.setBoundingBox(0, 0, obj.width, obj.height)

        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })

        if (this.asset || this.gid) {
            this.sprite = new Sprite({
                asset: this.asset, 
                gid: this.gid,
                width: this.width, 
                height: this.height
            }, game)
        }
    }

    setState (state) {
        if (isValidArray(this.states) && this.states.indexOf(state) !== -1) {
            this.state = state
        }
    }

    setBoundingBox (x, y, w, h) {
        this.bounds = new Box(new Vector(x, y), w, h)
    }

    setBoundingPolygon (x, y, points) {
        this.bounds = new Polygon(
            new Vector(x, y), 
            points.map((v) => new Vector(v[0], v[1]))
        )
    }

    getTranslatedBounds (x = this.x, y = this.y) {
        return this.bounds && this.bounds.toPolygon().translate(x, y)
    }

    onScreen () {
        const {
            camera,
            scene: { 
                resolutionX, 
                resolutionY,
                map: { 
                    tilewidth, 
                    tileheight 
                }
            }
        } = this.game

        const { x, y, width, height, radius } = this
        

        if (radius) {
            const cx = x + width / 2
            const cy = y + height / 2
            return (
                cx + radius > -camera.x &&
                cy + radius > -camera.y &&
                cx - radius < -camera.x + resolutionX &&
                cy - radius < -camera.y + resolutionY
            )
        }
        else {
            return (
                x + width + tilewidth > -camera.x &&
                y + height + tileheight > -camera.y &&
                x - tilewidth < -camera.x + resolutionX &&
                y - tileheight < -camera.y + resolutionY
            )
        }
    }

    draw () {
        if (this.onScreen() && this.sprite && this.visible) {
            const { camera } = this.game
            this.sprite.draw(
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            )
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
        const { scene } = this.game
        const { map: { tilewidth, tileheight } } = scene

        if (!this.force.x && !this.force.y) return 

        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed
        if (this.x + this.force.x < 0) this.force.x = 0
        if (this.y + this.force.y < 0) this.force.y = 0

        this.expectedX = this.x + this.force.x
        this.expectedY = this.y + this.force.y

        const PX = Math.round(this.expectedX / tilewidth)
        const PY = Math.round(this.expectedY / tileheight)
        const PW = Math.round((this.expectedX + this.width) / tilewidth)
        const PH = Math.round((this.expectedY + this.height) / tileheight)

        if (isValidArray(this.collisionLayers)) {
            this.collisionLayers.map((layer) => {
                for (let y = PY; y <= PH; y++) {
                    for (let x = PX; x <= PW; x++) {
                        const tile = scene.getTile(x, y, layer, true)
            
                        if (tile && tile.isSolid()) {
                            const isOneWay = tile.isOneWay()
                            const jumpThrough = !(isOneWay && this.force.y < 0 && !this.onFloor)
                            
                            const overlapY = tile.collide(
                                this.getTranslatedBounds(this.x, this.expectedY)
                            )
                            const overlapX = tile.collide(
                                this.getTranslatedBounds(this.expectedX, this.y)
                            )
                            if (overlapY && this.force.y !== 0 && jumpThrough) {
                                // fix overlaping when force.y is too high
                                if (this.force.y > tileheight / 2) {
                                    this.force.y = tileheight / 2
                                }
                                this.force.y += overlapY.y
                            }
                            if (overlapX) {
                                if (Math.abs(overlapX.y) && jumpThrough) {
                                    this.force.y += overlapX.y
                                }
                                else if (this.force.x !== 0 && !isOneWay) {
                                    this.force.x += overlapX.x
                                }
                            }
                        }
                    }
                }
            })
        }

        this.x += this.force.x
        this.y += this.force.y
        
        this.onFloor = this.y < this.expectedY
        this.onCeiling = this.y > this.expectedY
    }

    kill () {
        this.dead = true
    }

    getLight () {
        const { camera } = this.game
        this.light.position = new Vec2(
            this.x + (this.width / 2) + camera.x,
            this.y + (this.height / 2) + camera.y 
        )
        return this.light
    }

    getLightMask () {
        const { camera } = this.game
        const x = this.x + camera.x
        const y = this.y + camera.y
        const shadows = []

        if (this.shape === 'ellipse') {
            shadows.push(createDiscObject(x, y, this.width / 2))
        }
        else {
            // if (this.gid) {
            //     const tile = scene.createTile(this.gid)
            //     tile.collisionLayer.map(({points}) => {
            //         shadows.push(createPolygonObject(x, y, points))
            //     })
            // }
            const { pos, points } = this.getTranslatedBounds(x, y)
            shadows.push(createPolygonObject(pos.x, pos.y, points))
        }
        return shadows
    }

    restore () {
        this.activated = false
        this.dead = false
        this.animFrame = 0
    }
}
