import { Animation, Drawable } from 'tiled-platformer-lib'
import { getPerformance, isValidArray, normalize } from '../helpers'

export class Sprite implements Drawable {
    public animation: Animation
    public animFrame = 0
    public then = getPerformance()
    public frameStart = getPerformance()
    public flipV = false
    public flipH = false

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
        const { image, animation, animFrame, width, height, flipH, flipV } = this
        const scaleH = flipH ? -1 : 1 // Set horizontal scale to -1 if flip horizontal
        const scaleV = flipV ? -1 : 1 // Set verical scale to -1 if flip vertical
        const FX = flipH ? width * -1 : 0 // Set x position to -100% if flip horizontal 
        const FY = flipV ? height * -1 : 0 // Set y position to -100% if flip vertical
        const flip = flipH || flipV
        const [x1, y1] = [(x - FX) * scaleH, (y - FY) * scaleV]
            
        flip && ctx.scale(scaleH, scaleV)
        if (animation) {
            const { frames, strip } = animation
            const frame = isValidArray(frames) && frames[animFrame] || [0, 0]
            const posX = strip ? strip.x + animFrame * animation.width : frame[0]
            const posY = strip ? strip.y : frame[1]

            ctx.drawImage(image,
                posX, posY, animation.width, animation.height,
                x1, y1, animation.width * scale, animation.height * scale
            )
        }
        else if (image) {
            ctx.drawImage(image, 
                0, 0, width, height, x1, y1, width * scale, height * scale
            )
        }
        flip && ctx.scale(scaleH, scaleV)
    }
}

