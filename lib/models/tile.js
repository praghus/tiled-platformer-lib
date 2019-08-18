import { testPolygonPolygon, Polygon, Response } from 'sat'
import { getTileProperties } from '../helpers'
import { TILE_TYPE } from '../constants'

export default class Tile {
    constructor (id, x, y, game) {
        const { scene } = game
        const { tilewidth, tileheight } = scene.map

        this.id = id
        this.game = game
        this.x = x * tilewidth
        this.y = y * tileheight
        this.tileset = scene.getTileset(id)
        this.properties = getTileProperties(id, this.tileset)
        this.type = this.properties && this.properties.type || null
        this.width = this.tileset.tilewidth
        this.height = this.tileset.tileheight
        this.terrain = this.getTerrain()
        this.sprite = scene.createSprite(id, {
            gid: id,
            width: this.width,
            height: this.height
        })

        this.collisionMask = this.sprite.getCollisionMask(this.x, this.y)
    }

    overlapTest (polygon) {
        if (polygon instanceof Polygon) {
            const response = new Response()
            const hasCollision = this.collisionMask.some((shape) =>
                testPolygonPolygon(shape, polygon, response)
            )
            response.clear()
            return hasCollision && response.overlapV
        }
    }

    isSolid () {
        return this.type !== TILE_TYPE.NON_COLLIDING
    }

    isOneWay () {
        return this.type === TILE_TYPE.ONE_WAY
    }

    isInvisible () {
        return this.type === TILE_TYPE.INVISIBLE
    }

    isShadowCaster () {
        return this.isSolid() && !this.isOneWay()
    }

    getTerrain () {
        const { terrain } = this.properties
        return terrain && terrain.split(',').map((id) => id ? parseInt(id) : null)
    }

    draw () {
        if (this.isInvisible()) return

        const { camera, scene } = this.game
        const { tileheight } = scene.map
        
        this.sprite.draw(
            Math.floor(this.x + camera.x),
            Math.floor(this.y + camera.y + (tileheight - this.height))
        )
    }
}
