import { Box, Vector } from 'sat';
import { Entity } from './entity';
import { Viewport } from './viewport';
export declare class Camera {
    viewport: Viewport;
    x: number;
    y: number;
    bounds: Box;
    follow: Entity;
    focusPoint: Vector;
    constructor(viewport: Viewport);
    resize(viewport: Viewport): void;
    moveTo(x: number, y: number): void;
    center(): void;
    getBounds(): Box;
    setBounds(x: number, y: number, w: number, h: number): void;
    setFocusPoint(x: number, y: number): void;
    setFollow(follow: Entity, center?: boolean): void;
    update(): void;
}
//# sourceMappingURL=camera.d.ts.map