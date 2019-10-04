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
        readonly properties?: Record<string, any>;
        readonly objects?: TmxObject[];
        readonly image?: Record<string, any>;
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
        readonly properties: Record<string, any>;
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
        readonly properties?: Record<string, any>;
        readonly shape: string;
        readonly type: string;
        readonly width: number;
        readonly x: number;
        readonly y: number;
    }

    export interface Viewport {
        width: number;
        height: number;
        resolutionX: number;
        resolutionY: number;
        scale: number;
    }

    export interface EntityModel {
        asset?: string;
        animations?: StringTMap<Record<string, any>>;
        collisionLayers?: number[];
        model: Constructable<Entity>;
        type: string;
    }

// Classes

    export class Camera {
        x: number;
        y: number;
        scene: Scene;

        constructor (scene: Scene)

        center(): void;
        getBounds(): SAT.Box;
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
        properties: Record<string, any>;
        type: string;
        width: number;
        height: number;
        asset: HTMLImageElement;
        animation: Record<string, any>;
        animFrame: number;
        then: number;
        frameStart: number;
        terrain: number[];
        collisionMask: SAT.Polygon[];

        constructor(x?: number, y?: number);

        draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale?: number): void;
        getCollisionMask(posX: number, posY: number): SAT.Polygon[];
        getNextGid(): number;
        getTerrain(): number[];
        isSlope(): boolean;
        isSolid(): boolean;
        isOneWay(): boolean;
        isInvisible(): boolean;
        isShadowCaster(): boolean;
        overlapTest(obj: Entity, x: number, y: number): any 
    }

    export class Sprite {
        animFrame: number;
        animation: Record<string, any>;
        asset: HTMLImageElement;
        tile: Tile;
        frameStart: number;
        gid: number;
        height: number;
        then: number;
        width: number;

        constructor (props: StringTMap<any>, scene: Scene)

        animate(animation: Record<string, any>): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void;
    }

    export class Entity {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        type: string;
        aid: string;
        gid: number;
        radius: number;
        bounds: StringTMap<number>;
        properties: Record<string, any>;
        force: SAT.Vector;
        expectedPos: SAT.Vector;
        initialPos: SAT.Vector;
        collisionMask: SAT.Box | SAT.Polygon;
        collisionLayers: number[];
        points: [number[]];
        dead: boolean;
        onGround: boolean;
        shadowCaster: boolean;
        solid: boolean;
        visible: boolean;
        shape: string;
        light: any;
        sprite: Sprite;
        scene: Scene;

        constructor (obj: TmxObject, scene: Scene) 

        collide(obj: Entity, response: SAT.Response): void;
        draw(ctx: CanvasRenderingContext2D): void;
        getLight(): any;
        getLightMask(): any[];
        getTranslatedBounds(x: number, y: number): any;
        kill(): void;
        move(): void;
        onScreen(): boolean;
        overlapTest(obj: Entity): void;
        setBoundingBox(x: number, y: number, w: number, h: number): void;
        setBoundingPolygon(x: number, y: number, points: [number[]]): void;
        update(): void;
    }

    export class Layer {
        id: number;
        name: string;
        objects: any[];
        data: number[];
        type: string;
        properties: Record<string, any>;
        activeObjectsCount: number;
        width: number;
        height: number;
        visible: number;
        scene: Scene;

        constructor (scene: Scene, layerData?: TmxLayer) 

        addObject(obj: TmxObject, index: number): void;
        clearTile(x: number, y: number): void;
        draw(ctx: CanvasRenderingContext2D): void;
        getObjects(): Entity[];
        getTile(x: number, y: number): Tile;
        isInRange(x: number, y: number): boolean;
        putTile(x: number, y: number, tileId: number): void;
        removeObject(obj: Entity): void;
        renderTileLayer(ctx: CanvasRenderingContext2D): void;
        toggleVisibility(toggle: number): void;
        update(): void;
    }

    export class Scene {
        assets: StringTMap<HTMLImageElement>;
        camera: Camera;
        entities: EntityModel[];
        layers: Layer[];
        lights: any[];
        lightmask: any[];
        timeoutsPool: StringTMap<any>;
        properties: StringTMap<any>;
        sprites: StringTMap<Sprite>;
        tiles: StringTMap<Tile>;
        map: TmxMap;
        player: Entity;
        currentCameraId: number;
        shadowCastingLayerId: number;
        gravity: number;
        width: number;
        height: number;
        resolutionX: number;
        resolutionY: number;
        scale: number;
        timer: number;

        constructor (
            viewport: Viewport,
            props?: StringTMap<any>
        )

        resize(viewport: Viewport): void;
        addTmxMap(data: TmxMap, entities: EntityModel[]): void;
        addPlayer(player: Entity, cameraFollow?: boolean): void;
        update(): void;
        draw(ctx: CanvasRenderingContext2D): void;
        createSprite(id: string, props: Record<string, any>): Sprite;
        createTile(id: number): Tile;
        addLight(light: any): void;
        addLightMask(...args: any[]): void;
        setProperty(name: string, value: any): void;
        getProperty(name: string): any;
        createShadowCastingLayer(layerId: number, index: number): void;
        createCustomLayer(Layer: any, index: number): void;
        setGravity(gravity: number): void;
        addObject(obj: TmxObject, layerId: number, index: number): void;
        addLayer(layer: Layer, index?: number): void;
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
        putTile(x: number, y: number, tileId: number, layerId: number): void;
        clearTile(x: number, y: number, layerId: number): void;
        isSolidArea(x: number, y: number, layers: number[]): boolean;
        setCameraViewport(viewObj: Entity): void;
        checkTimeout(name: string): any;
        startTimeout(name: string, duration: number, f: () => any): void;
        stopTimeout(name: string): void;
    }
}

declare module 'tiled-platformer-lib' {
	export = TPL;
}