/// <reference types="typescript" />
/// <reference types="sat" />

declare namespace TPL {
    export interface StringTMap<T> {
        [key: string]: T;
    }

    export interface NumberTMap<T> {
        [key: number]: T;
    }

    export interface Constructable<T> {
        new(...args: any[]): T;
    }

    export interface Drawable {
        animation?: Animation;
        animFrame: number;
        then: number;
        frameStart: number; 

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
        readonly tiles: Tile[];
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

// Classes
    export class Viewport {
        width: number;
        height: number;
        resolutionX: number;
        resolutionY: number;
        scale: number;

        constructor(cols: number, rows: number);
        
        calculateSize (): void 
    }
    export class Input {
        states: StringTMap<string>;
        keys: StringTMap<any>;

        constructor (states: StringTMap<string>, keys: StringTMap<any>) ;
        
        onKey (val: number, e: KeyboardEvent): void;
    }

    export class Camera {
        x: number;
        y: number;
        bounds: SAT.Box;
        follow: Entity;
        middlePoint: SAT.Vector;
        magnitude: number;
        shakeDirection: number;

        constructor(viewport: Viewport); 

        center(): void;
        getBounds(): SAT.Box;
        resize(viewport: Viewport): void;
        setBounds(x: number, y: number, w: number, h: number): void;
        setDefaultMiddlePoint(): void;
        setFollow(follow: Entity, center?: boolean): void;
        setMiddlePoint(x: number, y: number): void;
        shake(): void;
        update(): void;
    }

    export class Tile {
        id: number;
        tileset: TmxTileset;
        properties: StringTMap<any>;
        type: string;
        width: number;
        height: number;
        image: HTMLImageElement;
        animFrame: number;
        then: number;
        frameStart: number;
        terrain: number[];
        collisionMask: SAT.Polygon[];

        constructor (
            id: number, 
            image: HTMLImageElement, 
            tileset: TmxTileset
        );

        collide (polygon: SAT.Polygon): SAT.Vector;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale?: number): void;
        getBounds(x: number, y: number): Bounds;
        getCollisionMask(posX: number, posY: number): SAT.Polygon[];
        getNextGid(): number;
        getTerrain(): number[];
        isCutomShape(): boolean;
        isSlope(): boolean;
        isSolid(): boolean;
        isOneWay(): boolean;
        isInvisible(): boolean;
        overlapTest(polygon: SAT.Polygon): any 
    }

    export class Sprite {
        public animation: Animation
        public animFrame: number;
        public then: number
        public frameStart: number;
    
        constructor(
            id: string, 
            image: HTMLImageElement, 
            width: number,
            height: number
        );

        animate(animation: StringTMap<any>): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void;
    }

    export class Entity {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        layerId: number;
        type: string;
        image: string;
        gid: number;
        radius: number;
        direction: string;
        bounds: StringTMap<number>;
        properties: StringTMap<any>;
        force: SAT.Vector;
        expectedPos: SAT.Vector;
        initialPos: SAT.Vector;
        collisionMask: SAT.Box | SAT.Polygon;
        collisionLayers: number[];
        points: [number[]];
        attached: boolean;
        dead: boolean;
        onGround: boolean;
        shadowCaster: boolean;
        solid: boolean;
        visible: boolean;
        shape: string;
        sprite: Drawable;
        light: any;

        constructor (obj: StringTMap<any>);

        collide(obj: Entity, scene: Scene, response: SAT.Response): void;
        input(scene: Scene): void;
        draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
        getTranslatedBounds(x: number, y: number): any;
        kill(): void;
        overlapTest(obj: Entity, scene: Scene): void;
        setBoundingBox(x: number, y: number, w: number, h: number): void;
        setBoundingPolygon(x: number, y: number, points: [number[]]): void;
        update(scene: Scene, time?: number): void;
    }

    export class Layer {
        id: number;
        name: string;
        objects: any[];
        data: number[];
        type: string;
        properties: StringTMap<any>;
        activeObjectsCount: number;
        width: number;
        height: number;
        visible: number;

        constructor(layerData?: TmxLayer);

        addObject(obj: Entity, index: number): void;
        clear(x: number, y: number): void;
        draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
        getObjects(): Entity[];
        get(x: number, y: number): number;
        isInRange(x: number, y: number): boolean;
        put(x: number, y: number, tileId: number): void;
        removeObject(obj: Entity): void;
        toggleVisibility(toggle: number): void;
        update(scene: Scene, time: number): void;
    }

    export class Scene {
        images: StringTMap<HTMLImageElement>;
        camera: Camera;
        input: Input;
        entities: StringTMap<any>;
        layers: Layer[];
        properties?: StringTMap<any>;
        tiles: StringTMap<Tile>;
        map: TmxMap;
        viewport: Viewport;
        currentCameraId: number;
        shadowCastingLayerId: number;

        constructor(
            images: StringTMap<HTMLImageElement>,
            viewport: Viewport,
            properties?: StringTMap<any>
        );

        addLayer(layer: Layer, index?: number): void;
        addTmxMap(data: TmxMap, entities: StringTMap<any>): void;
        addObject(entity: Entity, index?: number): void;
        createObject(obj: TmxObject, layerId: number): void;
        removeTile(x: number, y: number, layerId: number): void;
        createCustomLayer(Layer: any, index?: number): void;
        createTmxLayer(tmxLayer: TmxLayer): void
        createSprite(id: string, width: number, height: number): Sprite
        createTile(id: number): Tile;
        draw(ctx: CanvasRenderingContext2D): void;
        focus (entity?: Entity): void;
        onScreen(object: Entity): boolean;
        resize(viewport: Viewport): void;
        update(time: number, input?: Input): void;
        setProperty(name: string, value: any): void;
        getProperty(name: string): any;
        removeLayer(index: number): void;
        showLayer(layerId: number): void;
        hideLayer(layerId: number): void;
        getMapProperty(name: string): any;
        getObjects(layerId: number): Entity[];
        getObjectById(id: number, layerId: number): Entity;
        getObjectByType(type: string, layerId: number): Entity;
        getObjectByProperty(key: string, value: any, layerId: number): Entity;
        getObjectLayers(): Layer[];
        getLayer(id: number): Layer;
        getTileset(tileId: number): TmxTileset;
        getTile(x: number, y: number, layerId: number): Tile;
        getTileObject(gid: number): Tile;
        isSolidArea(x: number, y: number, layers: number[]): boolean;
        forEachVisibleObject(layerId: number, fn: (obj: Entity) => void): void;
        forEachVisibleTile(layerId: number, fn: (tile: Tile, x: number, y: number) => void): void;
    }
}

declare module 'tiled-platformer-lib' {
	export = TPL;
}