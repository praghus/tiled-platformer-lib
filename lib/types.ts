
export interface StringTMap<T> { [key: string]: T }
export interface NumberTMap<T> { [key: number]: T }
export interface Constructable<T> { new(...args: any[]): T }

export interface AnimationStrip {
    x: number;
    y: number;
    frames: number;
    duration: number;
}

export interface Animation {
    strip?: AnimationStrip;
    frames?: number[][];
    width: number;
    height: number;
    loop: boolean;
}

export interface Drawable {
    animation?: Animation;
    animFrame: number;
    then: number;
    frameStart: number;
    flipV: boolean;
    flipH: boolean;

    animate?(animation?: Animation): void;
    getNextGid?(): number;
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale?: number): void;
}

export interface Bounds {
    x: number;
    y: number;
    w: number;
    h: number;
}

// @todo: move to @tmx-tiledmap/types
export interface TmxFlip {
    readonly H: boolean;
    readonly V: boolean;
    readonly D: boolean;
}

export interface TmxLayer {
    readonly id: number;
    readonly name: string;
    readonly data?: number[];
    readonly properties?: StringTMap<any>;
    readonly objects?: TmxObject[];
    readonly image?: StringTMap<any>;
    readonly type: string;
    readonly width: number;
    readonly height: number;
    readonly visible: number;
}

export interface TmxMap {
    readonly backgroundcolor: string;
    readonly height: number;
    readonly infinite: number;
    readonly layers: TmxLayer[];
    readonly nextlayerid: number;
    readonly nextobjectid: number;
    readonly orientation: string;
    readonly properties: StringTMap<any>;
    readonly renderorder: string;
    readonly tiledversion: string;
    readonly tileheight: number;
    readonly tilewidth: number;
    readonly tilesets: TmxTileset[];
    readonly version: number;
    readonly width: number;
}

export interface TmxTileset {
    readonly columns: number;
    readonly firstgid: number;
    readonly name: string;
    readonly image: TmxImage;
    readonly spacing?: number;
    readonly margin?: number;
    readonly tilecount: number;
    readonly tileheight: number;
    readonly tilewidth: number;
    readonly tiles: any[];
}

export interface TmxImage {
    readonly height: number;
    readonly width: number;
    readonly source: string;
}

export interface TmxObject {
    readonly flips: TmxFlip;
    readonly gid?: number;
    readonly height: number;
    readonly id: number;
    readonly name: string;
    readonly properties?: StringTMap<any>;
    readonly shape: string;
    readonly type: string;
    readonly width: number;
    readonly x: number;
    readonly y: number;
}

