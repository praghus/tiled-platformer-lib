import { Tile, Scene, StringTMap } from 'tiled-platformer-lib'
import { getPerformance, isValidArray, normalize } from '../helpers'

export class Sprite {
    public gid: number
    public width: number
    public height: number
    public animFrame = 0
    public animation: Record<string, any>;
    public asset: HTMLImageElement;
    public tile: Tile
    public then: number
    public frameStart: number 

    constructor (props: StringTMap<any>, scene: Scene) {
        this.gid = props.gid
        this.asset = scene.assets[props.aid]
        this.tile = this.gid && scene.createTile(this.gid)
        this.height = props.height
        this.width = props.width
        this.animation = props.animation
        this.animFrame = 0
        this.then = getPerformance()
        this.frameStart = getPerformance()
    }

    animate (animation = this.animation): void {
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

    draw (ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
        const { asset, animation, animFrame, tile, width, height } = this
        if (tile) {
            tile.draw(ctx, x, y, scale)
        }
        else if (animation) {
            const { frames, strip } = animation
            const posX = strip
                ? strip.x + animFrame * animation.width
                : isValidArray(frames) && frames[animFrame][0]
            const posY = strip
                ? strip.y
                : isValidArray(frames) && frames[animFrame][1]

            ctx.drawImage(asset,
                posX, posY, animation.width, animation.height,
                x, y, animation.width * scale, animation.height * scale
            )
        }
        else if (asset) {
            ctx.drawImage(asset, 0, 0, width, height, x, y, width * scale, height * scale)
        }
    }
}

