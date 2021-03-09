import { StringTMap, TmxLayer } from '../types';
import { Entity } from './entity';
import { Scene } from './scene';
export declare class Layer {
    id: number;
    name: string;
    type: string;
    properties: StringTMap<any>;
    width: number;
    height: number;
    visible: number;
    data: number[];
    objects: any[];
    constructor(layerData?: TmxLayer);
    getObjects(): Entity[];
    update(scene: Scene, delta: number): void;
    draw(ctx: CanvasRenderingContext2D, scene: Scene): void;
    isInRange(x: number, y: number): boolean;
    get(x: number, y: number): number;
    put(x: number, y: number, tileId: number): void;
    clear(x: number, y: number): void;
    addObject(obj: Entity, index?: any): void;
    removeObject(obj: Entity): void;
    toggleVisibility(toggle: number): void;
}
//# sourceMappingURL=layer.d.ts.map