import Sprite from './sprite'
import { Vec2 } from './illuminated'
import { Box, Polygon, Response, Vector, testPolygonPolygon } from 'sat'
import { NODE_TYPE } from '../constants'
import { 
    calculatePolygonBounds, 
    createDiscObject, 
    createPolygonObject, 
    isValidArray 
} from '../helpers'

export default class Entity {
    constructor (obj, game) {        
        this.activated = false
        this.bounds = null
        this.collisionMask = null
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
        this.debugArray = []



        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })

        isValidArray(this.points)
            ? this.setBoundingPolygon(0, 0, this.points)
            : this.setBoundingBox(0, 0, obj.width, obj.height)


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
        this.bounds = { x, y, w, h }
        this.collisionMask = new Box(new Vector(0, 0), w, h).toPolygon().translate(x, y)
    }

    setBoundingPolygon (x, y, points) {
        this.bounds = calculatePolygonBounds(points)
        this.collisionMask = new Polygon(
            new Vector(x, y), 
            points.map((v) => new Vector(v[0], v[1]))
        )
    }

    getTranslatedBounds (x = this.x, y = this.y) {
        if (this.collisionMask instanceof Polygon) {
            this.collisionMask.pos.x = x
            this.collisionMask.pos.y = y
            return this.collisionMask
        }
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

        const { bounds, radius } = this
        const { x, y, w, h } = bounds

        if (radius) {
            const cx = this.x + x + w / 2
            const cy = this.y + y + h / 2
            return (
                cx + radius > -camera.x &&
                cy + radius > -camera.y &&
                cx - radius < -camera.x + resolutionX &&
                cy - radius < -camera.y + resolutionY
            )
        }
        else {
            const cx = this.x + x 
            const cy = this.y + y 
            return (
                cx + w + tilewidth > -camera.x &&
                cy + h + tileheight > -camera.y &&
                cx - tilewidth < -camera.x + resolutionX &&
                cy - tileheight < -camera.y + resolutionY
            )
        }
    }

    draw () {
        if (this.onScreen() && this.sprite && this.visible) {
            const { camera, ctx, debug } = this.game

            if (debug && this.debugArray) {
                this.debugArray.map(({x, y, color}) => {
                    ctx.save()
                    ctx.fillStyle = color
                    ctx.fillRect((x * 16) + camera.x, (y * 16) + camera.y, 16, 16)
                    ctx.restore()
                })
            }

            this.sprite.draw(
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            )
        }
    }

    collide (/*element, response*/) {

    }

    update () {

    }

    overlapTest (obj) {
        if ((this.onScreen() || this.activated) && this.collisionMask && obj.collisionMask) {
            const response = new Response()
            if (testPolygonPolygon(
                this.getTranslatedBounds(), obj.getTranslatedBounds(), response
            )) {
                this.collide(obj, response)
                obj.collide(this, response)
            }
            response.clear()
        }
    }

    move () { 
        const { scene, debug } = this.game
        const { map: { width, height, tilewidth, tileheight } } = scene

        if (!this.force.x && !this.force.y) return 

        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed

        this.expectedX = this.x + this.force.x
        this.expectedY =  this.y + this.force.y
        this.onFloor = false
        this.onCeiling = false
        this.debugArray = []

        if (this.expectedX < 0 || this.expectedX + this.width > width * tileheight) this.force.x = 0 
        if (this.expectedY + this.height < 0 || this.expectedY > height * tileheight) this.force.y = 0 

        // small hacks to prevent the object from getting jammed :/
        const PX = Math.ceil((this.expectedX + this.bounds.x + 0.3) / tilewidth) - 1
        const PY = Math.ceil((this.expectedY + this.bounds.y) / tileheight) - 1
        const PW = Math.ceil((this.expectedX + this.bounds.x + this.bounds.w) / tilewidth) 
        const PH = Math.ceil((this.expectedY + this.bounds.y + this.bounds.h) / tileheight) 

        if (isValidArray(this.collisionLayers) && this.collisionMask) {
            this.collisionLayers.map((layerId) => {
                const layer = scene.getLayer(layerId)
                if (layer.type === NODE_TYPE.LAYER) {
                    for (let y = PY; y < PH; y++) {
                        for (let x = PX; x < PW; x++) {
                            const tile = layer.getTile(x, y)

                            debug && this.debugArray.push({x, y, color: 'rgba(0,255,255,0.1)'})
                            if (tile && tile.isSolid()) {
                                const isOneWay = tile.isOneWay()
                                // fix overlaping when force.y is too high
                                if (this.force.y > tileheight / 2) {
                                    this.force.y = tileheight / 2
                                }

                                if (!(isOneWay && this.force.y < 0 && !this.onFloor)) {
                                    const overlap = tile.overlapTest(
                                        this.getTranslatedBounds(
                                            (this.x + this.force.x) - (x * tilewidth), 
                                            (this.y + this.force.y) - (y * tileheight) 
                                        )
                                    )
                                    if (overlap && overlap.y) {
                                        this.force.y += overlap.y
                                        this.onFloor = overlap.y < 0
                                        this.onCeiling = overlap.y > 0
                                        debug && this.debugArray.push({x, y, color: 'rgba(255,0,0,0.3)'})
                                    }
                                    else if (!isOneWay && overlap && overlap.x) {
                                        this.force.x += overlap.x 
                                        debug && this.debugArray.push({x, y, color: 'rgba(255,0,0,0.3'})
                                    }
                                }
                            }
                        }
                    }
                }
            })
        }

        this.x += this.force.x
        this.y += this.force.y
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
