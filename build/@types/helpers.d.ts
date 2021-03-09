import { Bounds, TmxTileset, StringTMap } from './types';
export declare const noop: () => void;
export declare const random: (min: number, max: number) => number;
export declare const randomInt: (min: number, max: number) => number;
export declare const boxOverlap: (a: Bounds, b: Bounds) => boolean;
export declare const isValidArray: (arr: any) => boolean;
export declare const getFilename: (path: string) => string;
export declare const normalize: (n: number, min: number, max: number) => number;
export declare const getEmptyImage: () => HTMLImageElement;
export declare const getPerformance: () => number;
export declare const getTileProperties: (gid: number, tileset: TmxTileset) => StringTMap<any>;
export declare function getProperties(obj: any, property: string): any;
export declare function calculatePolygonBounds(points: [number[]]): StringTMap<number>;
export declare function outline(ctx: CanvasRenderingContext2D): (x: any, y: any, width: any, height: any, color: any) => void;
export declare function stroke(ctx: any): (x: any, y: any, points: any, color: any) => void;
export declare function fillText(ctx: CanvasRenderingContext2D): (text: string, x: number, y: number, color?: string) => void;
export declare function lightMaskRect(x: number, y: number, points: any[]): any;
export declare function lightMaskDisc(x: number, y: number, radius: number): any;
//# sourceMappingURL=helpers.d.ts.map