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
        const { image, animation, animFrame, width, height } = this;
        if (animation) {
            const { frames, strip } = animation;
            const posX = strip
                ? strip.x + animFrame * animation.width
                : helpers_1.isValidArray(frames) && frames[animFrame][0];
            const posY = strip
                ? strip.y
                : helpers_1.isValidArray(frames) && frames[animFrame][1];
            ctx.drawImage(image, posX, posY, animation.width, animation.height, x, y, animation.width * scale, animation.height * scale);
        }
        else if (image) {
            ctx.drawImage(image, 0, 0, width, height, x, y, width * scale, height * scale);
        }
    }
}
exports.Sprite = Sprite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ByaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL21vZGVscy9zcHJpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0NBQW9FO0FBRXBFLE1BQWEsTUFBTTtJQU1mLFlBQ1csRUFBVSxFQUNWLEtBQXVCLEVBQ3ZCLEtBQWEsRUFDYixNQUFjO1FBSGQsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNWLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQ3ZCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBUmxCLGNBQVMsR0FBRyxDQUFDLENBQUE7UUFDYixTQUFJLEdBQUcsd0JBQWMsRUFBRSxDQUFBO1FBQ3ZCLGVBQVUsR0FBRyx3QkFBYyxFQUFFLENBQUE7SUFPakMsQ0FBQztJQUVKLE9BQU8sQ0FBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQTtRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLHdCQUFjLEVBQUUsQ0FBQTtRQUVsQyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1lBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO1NBQ3JCO1FBRUQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUs7WUFDNUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUTtZQUMxQixDQUFDLENBQUMsc0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0UsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUs7WUFDL0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTTtZQUN4QixDQUFDLENBQUMsc0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFFL0QsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxFQUFFO1lBQ3hDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxXQUFXLElBQUksU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxtQkFBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTthQUNqRTtpQkFDSSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFBO2FBQ3RCO1lBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBYyxFQUFFLENBQUE7U0FDL0I7SUFDTCxDQUFDO0lBRUQsSUFBSSxDQUFFLEdBQTZCLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFLLEdBQUcsQ0FBQztRQUNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQTtRQUMzRCxJQUFJLFNBQVMsRUFBRTtZQUNYLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsU0FBUyxDQUFBO1lBQ25DLE1BQU0sSUFBSSxHQUFHLEtBQUs7Z0JBQ2QsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLO2dCQUN2QyxDQUFDLENBQUMsc0JBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbEQsTUFBTSxJQUFJLEdBQUcsS0FBSztnQkFDZCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDLHNCQUFZLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRWxELEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUNmLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxFQUM3QyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUMxRCxDQUFBO1NBQ0o7YUFDSSxJQUFJLEtBQUssRUFBRTtZQUNaLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFBO1NBQ2pGO0lBQ0wsQ0FBQztDQUNKO0FBN0RELHdCQTZEQyJ9