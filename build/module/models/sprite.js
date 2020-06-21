import { getPerformance, isValidArray, normalize } from '../helpers';
export class Sprite {
    constructor(id, image, width, height) {
        this.id = id;
        this.image = image;
        this.width = width;
        this.height = height;
        this.animFrame = 0;
        this.then = getPerformance();
        this.frameStart = getPerformance();
    }
    animate(animation = this.animation) {
        this.animFrame = this.animFrame || 0;
        this.frameStart = getPerformance();
        if (this.animation !== animation) {
            this.animation = animation;
            this.animFrame = 0;
        }
        const duration = animation.strip
            ? animation.strip.duration
            : isValidArray(animation.frames) && animation.frames[this.animFrame][2];
        const framesCount = animation.strip
            ? animation.strip.frames
            : isValidArray(animation.frames) && animation.frames.length;
        if (this.frameStart - this.then > duration) {
            if (this.animFrame <= framesCount && animation.loop) {
                this.animFrame = normalize(this.animFrame + 1, 0, framesCount);
            }
            else if (this.animFrame < framesCount - 1 && !animation.loop) {
                this.animFrame += 1;
            }
            this.then = getPerformance();
        }
    }
    draw(ctx, x, y, scale = 1) {
        const { image, animation, animFrame, width, height } = this;
        if (animation) {
            const { frames, strip } = animation;
            const posX = strip
                ? strip.x + animFrame * animation.width
                : isValidArray(frames) && frames[animFrame][0];
            const posY = strip
                ? strip.y
                : isValidArray(frames) && frames[animFrame][1];
            ctx.drawImage(image, posX, posY, animation.width, animation.height, x, y, animation.width * scale, animation.height * scale);
        }
        else if (image) {
            ctx.drawImage(image, 0, 0, width, height, x, y, width * scale, height * scale);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ByaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL21vZGVscy9zcHJpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRXBFLE1BQU0sT0FBTyxNQUFNO0lBTWYsWUFDVyxFQUFVLEVBQ1YsS0FBdUIsRUFDdkIsS0FBYSxFQUNiLE1BQWM7UUFIZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFDdkIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLFdBQU0sR0FBTixNQUFNLENBQVE7UUFSbEIsY0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNiLFNBQUksR0FBRyxjQUFjLEVBQUUsQ0FBQTtRQUN2QixlQUFVLEdBQUcsY0FBYyxFQUFFLENBQUE7SUFPakMsQ0FBQztJQUVKLE9BQU8sQ0FBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQTtRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWMsRUFBRSxDQUFBO1FBRWxDLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7WUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUE7U0FDckI7UUFFRCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSztZQUM1QixDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRO1lBQzFCLENBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRTNFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLO1lBQy9CLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU07WUFDeEIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFFL0QsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxFQUFFO1lBQ3hDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxXQUFXLElBQUksU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO2FBQ2pFO2lCQUNJLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDMUQsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUE7YUFDdEI7WUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLGNBQWMsRUFBRSxDQUFBO1NBQy9CO0lBQ0wsQ0FBQztJQUVELElBQUksQ0FBRSxHQUE2QixFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBSyxHQUFHLENBQUM7UUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUE7UUFDM0QsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLFNBQVMsQ0FBQTtZQUNuQyxNQUFNLElBQUksR0FBRyxLQUFLO2dCQUNkLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSztnQkFDdkMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbEQsTUFBTSxJQUFJLEdBQUcsS0FBSztnQkFDZCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFbEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQ2YsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQzdDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQzFELENBQUE7U0FDSjthQUNJLElBQUksS0FBSyxFQUFFO1lBQ1osR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUE7U0FDakY7SUFDTCxDQUFDO0NBQ0oifQ==