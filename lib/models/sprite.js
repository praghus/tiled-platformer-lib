import { 
    getFilename, 
    getPerformance, 
    getTileProperties, 
    isValidArray, 
    normalize 
} from '../helpers'

export default class Sprite {
    constructor (props, game) {
        const {
            animation, 
            asset, 
            gid, 
            width, 
            height
        } = props
        
        this.game = game
        this.gid = gid
        this.animFrame = 0
        this.then = getPerformance()
        this.frameStart = getPerformance()

        if (gid) {
            this.tileset = game.scene.getTileset(gid)
            this.width = this.tileset.tilewidth
            this.height = this.tileset.tileheight
            this.asset = game.scene.assets[getFilename(this.tileset.image.source)]        
            this.properties = getTileProperties(gid, this.tileset)
            this.animation = this.properties && this.properties.animation
        }
        else {
            this.asset = asset
            this.height = height
            this.width = width
            this.animation = animation
        }
    }

    getTileGid () {
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
        else return this.gid
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

    draw (x, y) {
        const { 
            animation, 
            animFrame, 
            game, 
            gid, 
            width, 
            height 
        } = this

        const { ctx, scene: { assets } } = game
        const sprite = assets[this.asset]

        if (gid) {
            const {
                asset,
                tileset: {
                    columns,
                    firstgid,
                    tilewidth,
                    tileheight
                }
            } = this
            
            const tileGid = this.getTileGid()
            const posX =  ((tileGid - firstgid) % columns) * tilewidth
            const posY = (Math.ceil(((tileGid - firstgid) + 1) / columns) - 1) * tileheight
            
            ctx.drawImage(asset,
                posX, posY, tilewidth, tileheight,
                x, y, tilewidth, tileheight 
            )
        }
        else if (animation) {
            const { frames, strip } = animation
            const posX = strip
                ? strip.x + animFrame * animation.width
                : isValidArray(frames) && frames[animFrame][0]
            const posY = strip
                ? strip.y
                : isValidArray(frames) && frames[animFrame][1]
                
            ctx.drawImage(sprite,
                posX, posY, animation.width, animation.height,
                x, y, animation.width, animation.height
            )
        }
        else if (sprite) {
            ctx.drawImage(sprite, 0, 0, width, height, x, y, width, height)
        }
    }
}

