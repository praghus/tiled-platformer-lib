import { TmxObject, Scene, StringTMap, Drawable } from 'tiled-platformer-lib'
import { NODE_TYPE } from '../constants'
import {
    Box,
    Polygon,
    Response,
    Vector,
    testPolygonPolygon
} from 'sat'
import {
    boxOverlap,
    calculatePolygonBounds,
    isValidArray
} from '../helpers'

export class Entity {
    public id: number
    public x: number
    public y: number
    public width: number
    public height: number
    public type: string
    public aid: string
    public gid: number
    public radius: number
    public bounds: StringTMap<number>
    public properties: StringTMap<any>
    public force: SAT.Vector = new Vector(0, 0)
    public expectedPos: SAT.Vector
    public initialPos: SAT.Vector
    public collisionMask: SAT.Box | SAT.Polygon
    public collisionLayers: number[]
    public dead: boolean
    public attached: boolean
    public onGround: boolean
    public shadowCaster: boolean
    public solid: boolean
    public visible: boolean
    public shape: string
    public points: [number[]]
    public light: any
   

    public collide: (obj: Entity, scene: Scene, response: SAT.Response) => void
    // public update: (scene: Scene, time: number) => void

    constructor (obj: TmxObject, public sprite: Drawable) {
        this.initialPos = new Vector(obj.x, obj.y)
        Object.keys(obj).forEach((prop) => {
            this[prop] = obj[prop]
        })
        isValidArray(this.points)
            ? this.setBoundingPolygon(0, 0, this.points)
            : this.setBoundingBox(0, 0, obj.width, obj.height)
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

    // ctx, camera
    draw (ctx: CanvasRenderingContext2D, scene: Scene): void {
        if (scene.onScreen(this) && this.sprite && this.visible) {
            const { camera } = scene
            this.sprite.draw(ctx,
                Math.ceil(this.x + camera.x),
                Math.ceil(this.y + camera.y)
            )
        }
    }

    overlapTest (obj: Entity, scene: Scene): void {
        if ((scene.onScreen(this)) && this.collisionMask && obj.collisionMask) {
            const response = new Response()
            if (testPolygonPolygon(
                this.getTranslatedBounds(), obj.getTranslatedBounds(), response
            )) {
                this.collide && this.collide(obj, scene, response)
                obj.collide && obj.collide(this, scene, response)
            }
            response.clear()
        }
    }


    // moveTo(x, y) ?
    update (scene: Scene): void {
        if (!this.force.x && !this.force.y) return

        const { width, height, tilewidth, tileheight } = scene.map
        const b = this.bounds

        this.expectedPos = new Vector(this.x + this.force.x, this.y + this.force.y)

        if (this.expectedPos.x + b.x <= 0 || this.expectedPos.x + b.x + b.w >= width * tilewidth) this.force.x = 0
        if (this.expectedPos.y + b.y <= 0 || this.expectedPos.y + b.y + b.h >= height * tileheight) this.force.y = 0
                
        const offsetX = this.x + b.x
        const offsetY = this.y + b.y
        const PX = Math.ceil((this.expectedPos.x + b.x) / tilewidth) - 1
        const PY = Math.ceil((this.expectedPos.y + b.y) / tileheight) - 1
        const PW = Math.ceil((this.expectedPos.x + b.x + b.w) / tilewidth)
        const PH = Math.ceil((this.expectedPos.y + b.y + b.h) / tileheight)

        if (isValidArray(this.collisionLayers) && this.collisionMask) {
            for (const layerId of this.collisionLayers) {
                const layer = scene.getLayer(layerId)
                if (layer.type === NODE_TYPE.LAYER) {
                    for (let y = PY; y < PH; y++) {
                        for (let x = PX; x < PW; x++) {
                            const tile = scene.getTile(x, y, layer.id)
                            const nextX = { x: offsetX + this.force.x, y: offsetY, w: b.w, h: b.h }
                            const nextY = { x: offsetX, y: offsetY + this.force.y, w: b.w, h: b.h }

                            if (tile && tile.isSolid()) {
                                if (tile.isCutomShape() && !(tile.isOneWay() && this.force.y < 0)) {
                                    const overlap = tile.collide(
                                        this.getTranslatedBounds(
                                            this.x + this.force.x - (x * tilewidth),
                                            this.y + this.force.y - (y * tileheight)
                                        )
                                    )
                                    this.force.x += overlap.x
                                    this.force.y += overlap.y
                                } 
                                else {
                                    const t = tile.getBounds(x, y)
                                    if (boxOverlap(nextX, t) && Math.abs(this.force.x) > 0 && !tile.isOneWay()) {
                                        this.force.x = this.force.x < 0
                                            ? t.x + tile.width - offsetX
                                            : t.x - b.w - offsetX
                                    }
                                    if (boxOverlap(nextY, t)) {
                                        if (!tile.isOneWay() && Math.abs(this.force.y) > 0) {
                                            this.force.y = this.force.y < 0
                                                ? t.y + tile.height - offsetY
                                                : t.y - b.h - offsetY 
                                        }
                                        else if (this.force.y >= 0 && tile.isOneWay() && this.y + b.y + b.h <= t.y) {
                                            this.force.y = t.y - b.h - offsetY 
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.x += this.force.x 
        this.y += this.force.y 
        this.onGround = this.y < this.expectedPos.y
    }

    kill (): void {
        this.dead = true
    }
}
