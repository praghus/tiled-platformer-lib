import { TmxObject, Scene, StringTMap } from 'tiled-platformer-lib'
import { NODE_TYPE } from '../constants'
import { Sprite } from './sprite'
import { Point } from 'lucendi'
import { 
    Box, 
    Polygon, 
    Response, 
    Vector, 
    testPolygonPolygon 
} from 'sat'
import {
    calculatePolygonBounds,
    createDiscObject,
    createPolygonObject,
    isValidArray
} from '../helpers'


export class Entity {
    public id: number
    // @todo: replace x, y with SAT.Vector pos
    public x: number
    public y: number
    public width: number
    public height: number
    public type: string
    public aid: string
    public gid: number
    public radius: number
    public bounds: StringTMap<number>
    public properties: Record<string, any>
    public force: SAT.Vector = new Vector(0, 0)
    public expectedPos: SAT.Vector
    public initialPos: SAT.Vector
    public collisionMask: SAT.Box | SAT.Polygon
    public dead: boolean
    public collisionLayers: number[]
    public onGround: boolean 
    public shadowCaster: boolean
    public solid: boolean
    public visible: boolean
    public shape: string
    public points: [number[]]
    public light: any
    public sprite: Sprite

    // public debugArray: any[]

    public collide: (obj: Entity, response: SAT.Response) => void
    public update: () => void

    constructor (obj: TmxObject, public scene: Scene) {
        this.initialPos = new Vector(obj.x, obj.y)
        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })

        isValidArray(this.points)
            ? this.setBoundingPolygon(0, 0, this.points)
            : this.setBoundingBox(0, 0, obj.width, obj.height)

        if (this.aid || this.gid) {
            this.sprite = new Sprite({
                aid: this.aid,
                gid: this.gid,
                width: this.width,
                height: this.height
            }, this.scene)
        }
    }

    setBoundingBox (x: number, y: number, w: number, h: number): void {
        this.bounds = { x, y, w, h }
        this.collisionMask = new Box(new Vector(0, 0), w, h).toPolygon().translate(x, y)
    }

    setBoundingPolygon (x: number, y: number, points: [number[]]): void {
        this.bounds = calculatePolygonBounds(points)
        this.collisionMask = new Polygon(
            new Vector(x, y),
            points.map((v) => new Vector(v[0], v[1]))
        )
    }

    getTranslatedBounds (x = this.x, y = this.y): any {
        if (this.collisionMask instanceof Polygon) {
            this.collisionMask.pos.x = x
            this.collisionMask.pos.y = y
            return this.collisionMask
        }
    }

    onScreen (): boolean {
        const {
            camera,
            resolutionX,
            resolutionY,
            map: {
                tilewidth,
                tileheight
            }
        } = this.scene

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


    draw (ctx: CanvasRenderingContext2D): void {
        if (this.onScreen() && this.sprite && this.visible) {
            const { camera } = this.scene
            
            // const debug = this.scene.getProperty('debug')
            // if (debug && this.debugArray) {
            //     this.debugArray.map(({x, y, color}) => {
            //         ctx.save()
            //         ctx.fillStyle = color
            //         ctx.fillRect((x * 16) + camera.x, (y * 16) + camera.y, 16, 16)
            //         ctx.restore()
            //     })
            // }

            this.sprite.draw(ctx,
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            )
        }
    }

    overlapTest (obj: Entity): void {
        if ((this.onScreen()) && this.collisionMask && obj.collisionMask) {
            const response = new Response()
            if (testPolygonPolygon(
                this.getTranslatedBounds(), obj.getTranslatedBounds(), response
            )) {
                this.collide && this.collide(obj, response)
                obj.collide && obj.collide(this, response)
            }
            response.clear()
        }
    }

    move (): void {
        if (!this.force.x && !this.force.y) return
        
        const { map: { tilewidth, tileheight } } = this.scene
        // const debug = this.scene.getProperty('debug')
        // this.debugArray = []
        
        this.expectedPos = new Vector(this.x + this.force.x, this.y + this.force.y)
        const PX = Math.ceil((this.expectedPos.x + this.bounds.x + 0.3) / tilewidth) - 1
        const PY = Math.ceil((this.expectedPos.y + this.bounds.y) / tileheight) - 1
        const PW = Math.ceil((this.expectedPos.x + this.bounds.x + this.bounds.w) / tilewidth)
        const PH = Math.ceil((this.expectedPos.y + this.bounds.y + this.bounds.h) / tileheight)

        if (isValidArray(this.collisionLayers) && this.collisionMask) {
            this.collisionLayers.map((layerId) => {
                const layer = this.scene.getLayer(layerId)
                if (layer.type === NODE_TYPE.LAYER) {
                    for (let y = PY; y < PH; y++) {
                        for (let x = PX; x < PW; x++) {
                            const tile = layer.getTile(x, y)
                            // debug && this.debugArray.push({x, y, color: 'rgba(0,255,255,0.1)'})
                            if (tile && tile.isSolid()) {
                                // fix overlaping when force.y is too high
                                this.force.y = Math.min(this.force.y, tileheight / 2)
                                const overlap = tile.overlapTest(this, x, y)
                                if (overlap) {
                                    // debug && this.debugArray.push({x, y, color: 'rgba(255,0,0,0.3)'})
                                    if (overlap.y && !(tile.isOneWay() && this.force.y < 0)) {
                                        this.force.y += overlap.y
                                    }
                                    else if (!tile.isSlope() && !tile.isOneWay()) {
                                        this.force.x += overlap.x
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
        this.onGround = this.y < this.expectedPos.y
        if (Math.abs(this.force.y) <= 0.2) {
            this.force.y = 0
        }
    }

    kill (): void {
        this.dead = true
    }

    getLight (): any {
        const { camera } = this.scene
        this.light.position = new Point(
            this.x + (this.width / 2) + camera.x,
            this.y + (this.height / 2) + camera.y
        )
        return this.light
    }

    getLightMask (): any[] {
        const { camera } = this.scene
        const x = this.x + camera.x
        const y = this.y + camera.y
        const shadows = []

        if (this.shape === 'ellipse') {
            shadows.push(createDiscObject(x, y, this.width / 2))
        }
        else {
            const { pos, points } = this.getTranslatedBounds(x, y)
            shadows.push(createPolygonObject(pos.x, pos.y, points))
        }
        return shadows
    }
}
