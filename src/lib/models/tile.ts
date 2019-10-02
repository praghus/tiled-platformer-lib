import { TmxTileset, Scene } from 'tiled-platformer-lib'
import {
    testPolygonPolygon,
    Box,
    Polygon,
    Response,
    Vector
} from 'sat'
import {
    getFilename,
    getPerformance,
    getProperties,
    getTileProperties,
    isValidArray,
    normalize
} from '../helpers'
import { TILE_TYPE } from '../constants'

export class Tile {
    public id: number;
    public tileset: TmxTileset;
    public properties: Record<string, any>;
    public type: string;
    public width: number;
    public height: number;
    public asset: HTMLImageElement;
    public animation: Record<string, any>;
    public animFrame: number;
    public then: number;
    public frameStart: number;
    public terrain: number[];
    public collisionMask: SAT.Polygon[]; 

    constructor (id: number, scene: Scene) {
        this.id = id
        this.tileset = scene.getTileset(id)
        this.properties = getTileProperties(id, this.tileset)
        this.type = this.properties && this.properties.type || null
        this.width = this.tileset.tilewidth
        this.height = this.tileset.tileheight
        this.asset = scene.assets[getFilename(this.tileset.image.source)]
        this.animation = this.properties && this.properties.animation
        this.animFrame = 0
        this.then = getPerformance()
        this.frameStart = getPerformance()
        this.terrain = this.getTerrain()
        this.collisionMask = this.getCollisionMask()
    }

    overlapTest (polygon: SAT.Polygon): any {
        if (polygon instanceof Polygon) {
            const response = new Response()
            const hasCollision = this.collisionMask.some(
                (shape) => testPolygonPolygon(shape, polygon, response)
            )
            response.clear()
            return hasCollision && response.overlapV
        }
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

    isShadowCaster (): boolean {
        return this.isSolid() && !this.isOneWay()
    }

    getTerrain (): number[] {
        const { terrain } = this.properties
        return terrain && terrain.split(',').map((id: string) => id ? parseInt(id) : null)
    }

    getNextGid (): number {
        const { tileset: { firstgid } } = this
        if (this.animation && this.animation.frames) {
            this.frameStart = getPerformance()
            const duration = this.animation.frames[this.animFrame].duration
            if (this.frameStart - this.then > duration) {
                if (this.animFrame <= this.animation.frames.length) {
                    this.animFrame = normalize(this.animFrame + 1, 0, this.animation.frames.length)
                }
                this.then = getPerformance()
            }
            return this.animation.frames[this.animFrame].tileid + firstgid
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

    draw (ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
        if (!this.isInvisible()) {
            const {
                asset,
                tileset: {
                    columns,
                    firstgid,
                    tilewidth,
                    tileheight
                }
            } = this

            const tileGid = this.getNextGid()
            const posX = ((tileGid - firstgid) % columns) * tilewidth
            const posY = (Math.ceil(((tileGid - firstgid) + 1) / columns) - 1) * tileheight

            ctx.drawImage(asset,
                posX, posY, tilewidth, tileheight,
                x, y, tilewidth * scale, tileheight * scale
            )
        }
    }
}
