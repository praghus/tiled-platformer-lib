import { Bounds, Drawable, StringTMap, TmxTileset } from '../types';
import { Polygon, Response, Vector } from 'sat';
export declare class Tile implements Drawable {
    id: number;
    image: HTMLImageElement;
    tileset: TmxTileset;
    properties: StringTMap<any>;
    type: string;
    width: number;
    height: number;
    animFrame: number;
    then: number;
    frameStart: number;
    terrain: number[];
    collisionMasks: Polygon[];
    flipV: boolean;
    flipH: boolean;
    constructor(id: number, image: HTMLImageElement, tileset: TmxTileset);
    isCutomShape: () => boolean;
    isSlope: () => boolean;
    isSolid: () => boolean;
    isOneWay: () => boolean;
    isInvisible: () => boolean;
    overlapTest(polygon: Polygon): Response;
    collide(polygon: Polygon): Vector;
    getBounds(x: number, y: number): Bounds;
    getTerrain(): number[];
    getNextGid(): number;
    getCollisionMask(posX?: number, posY?: number): Polygon[];
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale?: number): void;
}
//# sourceMappingURL=tile.d.ts.map