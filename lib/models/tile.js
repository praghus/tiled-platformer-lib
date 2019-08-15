import { testPolygonPolygon, Box, Polygon, Vector, Response } from 'sat'
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
        this.collisionLayer = this.createCollisionLayer()

        this.sprite = scene.createSprite(id, {
            gid: id,
            width: this.width,
            height: this.height
        })
    }

    collide (polygon) {
        const response = new Response()
        const hasCollision = this.collisionLayer.some((shape) =>
            testPolygonPolygon(shape, polygon, response)
        )
        return hasCollision && response.overlapV
    }

    isSolid () {
        return this.type !== TILE_TYPE.NON_COLLIDING
    }

    isOneWay () {
        return this.type === TILE_TYPE.ONE_WAY
    }

    isShadowCaster () {
        return this.isSolid() && !this.isOneWay()
    }

    createCollisionLayer () {
        const { objects } = this.properties
        const collisionLayer = []
        objects && objects.map(({shape, x, y, width, height, points}) => {
            switch (shape) {
            case 'polygon':
                collisionLayer.push(
                    new Polygon(
                        new Vector(this.x, this.y), points.map(
                            (v) => new Vector(x + v[0], y + v[1])
                        )
                    )
                )
                break
            case 'ellipse':
            case 'rectangle':
                collisionLayer.push(
                    new Box(
                        new Vector(this.x + x, this.y + y), 
                        width, 
                        height
                    ).toPolygon()
                )
                break
            }
        }) || collisionLayer.push(
            new Box(
                new Vector(this.x, this.y), 
                this.width, 
                this.height
            ).toPolygon()
        )
        
        return collisionLayer
    }

    getTerrain () {
        const { terrain } = this.properties
        return terrain && terrain.split(',').map((id) => id ? parseInt(id) : null)
    }

    draw () {
        const { camera, scene } = this.game
        const { tileheight } = scene.map

        this.sprite.draw(
            Math.floor(this.x + camera.x),
            Math.floor(this.y + camera.y + (tileheight - this.height))
        )
    }
}
