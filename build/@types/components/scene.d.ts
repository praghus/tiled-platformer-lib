import { Constructable, StringTMap, TmxMap, TmxObject, TmxTileset, TmxLayer } from '../types';
import { Camera, Entity, Input, Layer, Sprite, Tile, Viewport } from '../index';
export declare class Scene {
    images: StringTMap<HTMLImageElement>;
    viewport: Viewport;
    properties: StringTMap<any>;
    camera: Camera;
    input: Input;
    entities: StringTMap<any>;
    layers: Layer[];
    tiles: StringTMap<Tile>;
    timeoutsPool: Record<string, any>;
    map: TmxMap;
    currentCameraId: number;
    shadowCastingLayerId: number;
    debug: boolean;
    constructor(images: StringTMap<HTMLImageElement>, viewport: Viewport, properties?: StringTMap<any>);
    /**
     * Update handler
     * @param time
     * @param input
     */
    update(delta: number, input?: Input): void;
    /**
     * Draw handler
     * @param ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Add new layer
     * @param layer
     * @param index
     */
    addLayer(layer: Layer, index?: number): Layer;
    addObject(entity: Entity, index?: number): void;
    createTmxMap(data: TmxMap, entities: StringTMap<any>): void;
    createTmxLayer(tmxLayer: TmxLayer): void;
    createTile(id: number): Tile;
    createObject(obj: TmxObject, layerId: number): void;
    onScreen(object: Entity): boolean;
    isSolidArea(x: number, y: number, layers: number[]): boolean;
    forEachVisibleObject(layerId: number, fn?: (obj: Entity) => void): void;
    forEachVisibleTile(layerId: number, fn?: (tile: Tile, x: number, y: number) => void): void;
    checkTimeout: (name: string) => boolean;
    startTimeout(name: string, duration: number, fn?: () => void): void;
    stopTimeout(name: string): void;
    createCustomLayer: (Layer: Constructable<Layer>, index?: number) => Layer;
    createSprite: (id: string, width: number, height: number) => Sprite;
    setProperty: (name: string, value: any) => void;
    getProperty: (name: string) => any;
    getMapProperty: (name: string) => any;
    getObjects: (layerId: number) => Entity[];
    getObjectById: (id: string, layerId: number) => Entity;
    getObjectByType: (type: string, layerId: number) => Entity;
    getObjectsByType: (type: string, layerId: number) => Entity[];
    getObjectByProperty: (key: string, value: any, layerId: number) => Entity;
    getObjectLayers: () => Layer[];
    getLayer: (id: number) => Layer;
    getTileset: (tileId: number) => TmxTileset;
    getTile: (x: number, y: number, layerId: number) => Tile;
    getTileObject: (gid: number) => Tile;
    resize: (viewport: Viewport) => void;
    removeLayer: (index: number) => void;
    removeTile: (x: number, y: number, layerId: number) => void;
    showLayer: (layerId: number) => void;
    hideLayer: (layerId: number) => void;
}
//# sourceMappingURL=scene.d.ts.map