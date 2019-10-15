import { Bounds, Drawable, TmxTileset, StringTMap } from 'tiled-platformer-lib'
import { TILE_TYPE } from '../constants'
import {
    testPolygonPolygon,
    Box,
    Polygon,
    Response,
    Vector
} from 'sat'
import {
    getPerformance,
    getProperties,
    getTileProperties,
    isValidArray,
    normalize
} from '../helpers'

export class Tile implements Drawable {
    public properties: StringTMap<any>
    public type: string
    public width: number
    public height: number
    public animFrame = 0
    public then = getPerformance()
    public frameStart = getPerformance()
    public terrain: number[]
    public collisionMask: SAT.Polygon[]

    constructor (
        public id: number, 
        public asset: HTMLImageElement, 
        public tileset: TmxTileset
    ) {
        this.properties = getTileProperties(id, this.tileset)
        this.type = this.properties && this.properties.type || null
        this.width = this.tileset.tilewidth
        this.height = this.tileset.tileheight
        this.terrain = this.getTerrain()
        this.collisionMask = this.getCollisionMask()
    }

    overlapTest (polygon: SAT.Polygon): SAT.Response {
        const response = new Response()
        const hasCollision = this.collisionMask.some(
            (shape) => testPolygonPolygon(shape, polygon, response)
        )
        response.clear()
        return hasCollision && response
    }

    collide (polygon: SAT.Polygon): SAT.Vector {
        const overlap = this.overlapTest(polygon)
        let x: number, y: number
        if (overlap) {
            x = this.isSlope() || this.isOneWay() ? 0 : overlap.overlapV.x
            y = overlap.overlapV.y
        }
        return new Vector(x, y)
    }

    getBounds (x: number, y: number): Bounds {
        return {
            x: x * this.width,
            y: y * this.height,
            w: this.width,
            h: this.height
        }
    }

    getTerrain (): number[] {
        const { terrain } = this.properties
        return terrain && terrain.split(',').map((id: string) => id ? parseInt(id) : null)
    }

    getNextGid (): number {
        const { tileset: { firstgid } } = this
        if (this.properties && this.properties.animation) {
            this.frameStart = getPerformance()
            const { frames } = this.properties.animation
            if (this.frameStart - this.then > frames[this.animFrame].duration) {
                if (this.animFrame <= frames.length) {
                    this.animFrame = normalize(this.animFrame + 1, 0, frames.length)
                }
                this.then = getPerformance()
            }
            return frames[this.animFrame].tileid + firstgid
        }
        else return this.id
    }

    getCollisionMask (posX = 0, posY = 0): SAT.Polygon[] {
        const objects = getProperties(this, 'objects')
        return isValidArray(objects)
            ? objects.map(({ shape, x, y, width, height, points }) =>
                shape === 'polygon'
                    ? new Polygon(new Vector(posX, posY), points.map(
                        ([x1, y1]) => new Vector(x + x1, y + y1)
                    ))
                    : new Box(new Vector(posX + x, posY + y), width, height).toPolygon()
            )
            : [new Box(new Vector(posX, posY), this.width, this.height).toPolygon()]
    }

    isCutomShape (): boolean {
        return getProperties(this, 'objects')
    }

    isSlope (): boolean {
        return this.type === TILE_TYPE.SLOPE
    }

    isSolid (): boolean {
        return this.type !== TILE_TYPE.NON_COLLIDING
    }

    isOneWay (): boolean {
        return this.type === TILE_TYPE.ONE_WAY
    }

    isInvisible (): boolean {
        return this.type === TILE_TYPE.INVISIBLE
    }

    draw (ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
        if (!this.isInvisible()) {
            const { asset, tileset: { columns, firstgid, tilewidth, tileheight } } = this
            const tileGid = this.getNextGid()
            const posX = ((tileGid - firstgid) % columns) * tilewidth
            const posY = (Math.ceil(((tileGid - firstgid) + 1) / columns) - 1) * tileheight
            //y = (tileheight - tile.height)
            ctx.drawImage(asset,
                posX, posY, tilewidth, tileheight,
                x, y, tilewidth * scale, tileheight * scale
            )
        }
    }
}
