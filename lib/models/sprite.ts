import { Animation, Drawable } from 'tiled-platformer-lib'
import { getPerformance, isValidArray, normalize } from '../helpers'

export class Sprite implements Drawable {
    public animation: Animation
    public animFrame = 0
    public then = getPerformance()
    public frameStart = getPerformance()

    constructor (
        public id: string, 
        public image: HTMLImageElement, 
        public width: number,
        public height: number
    ) {}

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

    draw (ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1): void {
        const { image, animation, animFrame, width, height } = this
        if (animation) {
            const { frames, strip } = animation
            const posX = strip
                ? strip.x + animFrame * animation.width
                : isValidArray(frames) && frames[animFrame][0]
            const posY = strip
                ? strip.y
                : isValidArray(frames) && frames[animFrame][1]

            ctx.drawImage(image,
                posX, posY, animation.width, animation.height,
                x, y, animation.width * scale, animation.height * scale
            )
        }
        else if (image) {
            ctx.drawImage(image, 0, 0, width, height, x, y, width * scale, height * scale)
        }
    }
}

