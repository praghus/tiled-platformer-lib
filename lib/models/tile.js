import { isValidArray, normalize } from '../helpers'

export default class Tile {
    constructor (id, properties) {
        this.id = id - 1
        this.animFrame = 0
        this.animCount = 0
        this.properties = properties
        this.animation = this.getAnimation()
        this.terrain = this.getTerrain()
    } 

    getAnimation () {
        const props = this.getTileProperties()
        return props && props.animation
    }

    getTerrain () {
        const props = this.getTileProperties()
        return props && props.terrain && props.terrain.split(',').map(
            (id) => id ? parseInt(id) : null
        )
    }

    getTileProperties () {
        const { id, properties: { tileset: { tiles } } } = this
        return isValidArray(tiles) && tiles.filter((tile) => tile.id === id)[0]
    }

    getSprite () {
        if (this.animation && this.animation.frames) {
            const duration = 1000 / parseInt(this.animation.frames[this.animFrame].duration) 
            if (++(this.animCount) === Math.round(60 / duration)) {
                if (this.animFrame <= this.animation.frames.length) {
                    this.animFrame = normalize(this.animFrame + 1, 0, this.animation.frames.length)
                }
                this.animCount = 0
            }
            return this.animation.frames[this.animFrame].tileid + 1
        } 
        else return this.id + 1
    }

    draw (x, y, ctx) {
        const { 
            asset, 
            tileset: { 
                columns, 
                firstgid,
                tilewidth,
                tileheight
            }
        } = this.properties
        
        const sprite = this.getSprite()
        
        ctx.drawImage(
            asset,
            ((sprite - firstgid) % columns) * tilewidth,
            (Math.ceil(((sprite - firstgid) + 1) / columns) - 1)  * tileheight,
            tilewidth, tileheight, 
            x, y,
            tilewidth, tileheight
        )
    }
}
