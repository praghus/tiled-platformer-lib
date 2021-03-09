import { Animation, Drawable } from '../types';
export declare class Sprite implements Drawable {
    id: string;
    image: HTMLImageElement;
    width: number;
    height: number;
    animation: Animation;
    animFrame: number;
    then: number;
    frameStart: number;
    flipV: boolean;
    flipH: boolean;
    constructor(id: string, image: HTMLImageElement, width: number, height: number);
    animate(animation?: Animation): void;
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale?: number): void;
}
//# sourceMappingURL=sprite.d.ts.map