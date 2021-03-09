"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sprite = void 0;
const helpers_1 = require("../helpers");
class Sprite {
    constructor(id, image, width, height) {
        this.id = id;
        this.image = image;
        this.width = width;
        this.height = height;
        this.animFrame = 0;
        this.then = helpers_1.getPerformance();
        this.frameStart = helpers_1.getPerformance();
        this.flipV = false;
        this.flipH = false;
    }
    animate(animation = this.animation) {
        this.animFrame = this.animFrame || 0;
        this.frameStart = helpers_1.getPerformance();
        if (this.animation !== animation) {
            this.animation = animation;
            this.animFrame = 0;
        }
        const duration = animation.strip
            ? animation.strip.duration
            : helpers_1.isValidArray(animation.frames) && animation.frames[this.animFrame][2];
        const framesCount = animation.strip
            ? animation.strip.frames
            : helpers_1.isValidArray(animation.frames) && animation.frames.length;
        if (this.frameStart - this.then > duration) {
            if (this.animFrame <= framesCount && animation.loop) {
                this.animFrame = helpers_1.normalize(this.animFrame + 1, 0, framesCount);
            }
            else if (this.animFrame < framesCount - 1 && !animation.loop) {
                this.animFrame += 1;
            }
            this.then = helpers_1.getPerformance();
        }
    }
    draw(ctx, x, y, scale = 1) {
        const { image, animation, animFrame, width, height, flipH, flipV } = this;
        const scaleH = flipH ? -1 : 1; // Set horizontal scale to -1 if flip horizontal
        const scaleV = flipV ? -1 : 1; // Set verical scale to -1 if flip vertical
        const FX = flipH ? width * -1 : 0; // Set x position to -100% if flip horizontal 
        const FY = flipV ? height * -1 : 0; // Set y position to -100% if flip vertical
        const flip = flipH || flipV;
        const [x1, y1] = [(x - FX) * scaleH, (y - FY) * scaleV];
        flip && ctx.scale(scaleH, scaleV);
        if (animation) {
            const { frames, strip } = animation;
            const frame = helpers_1.isValidArray(frames) && frames[animFrame] || [0, 0];
            const posX = strip ? strip.x + animFrame * animation.width : frame[0];
            const posY = strip ? strip.y : frame[1];
            ctx.drawImage(image, posX, posY, animation.width, animation.height, x1, y1, animation.width * scale, animation.height * scale);
        }
        else if (image) {
            ctx.drawImage(image, 0, 0, width, height, x1, y1, width * scale, height * scale);
        }
        flip && ctx.scale(scaleH, scaleV);
    }
}
exports.Sprite = Sprite;
//# sourceMappingURL=sprite.js.map