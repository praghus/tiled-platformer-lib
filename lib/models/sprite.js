
import { 
    getPerformance, 
    isValidArray, 
    normalize 
} from '../helpers'

export default class Sprite {
    constructor (props, game) {
        const {
            animation, 
            gid,
            asset,
            width, 
            height
        } = props
        
        this.game = game
        this.asset = asset
        this.gid = gid
        this.tile = gid && game.scene.createTile(gid)
        this.height = height
        this.width = width
        this.animation = animation
        this.animFrame = 0
        this.then = getPerformance()
        this.frameStart = getPerformance()
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

    draw (x, y, scale = 1) {
        const { 
            animation, 
            animFrame, 
            game, 
            tile,
            width, 
            height 
        } = this

        const { ctx, scene: { assets } } = game
        const sprite = assets[this.asset]

        if (tile) {
            tile.draw(x, y, scale)
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
                x, y, animation.width * scale, animation.height * scale
            )
        }
        else if (sprite) {
            ctx.drawImage(sprite, 0, 0, width, height, x, y, width * scale, height * scale)
        }
    }
}

