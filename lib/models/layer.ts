import { TmxLayer } from 'tiled-platformer-lib'
import { fillText, isValidArray, stroke } from '../helpers'
import { COLORS, NODE_TYPE } from '../constants'
import { Entity } from './entity'
import { Scene } from './scene'

export class Layer {
    public id: number
    public name: string
    public type: string = NODE_TYPE.CUSTOM
    public properties: StringTMap<any> = {}
    public width: number
    public height: number
    public visible: number
    public data: number[] = []
    public objects: any[] = []

    constructor (layerData?: TmxLayer) {
        if (layerData) {
            this.id = layerData.id
            this.name = layerData.name || ''
            this.type = layerData.type || NODE_TYPE.CUSTOM
            this.visible = layerData.visible === undefined ? 1 : layerData.visible
            this.properties = layerData.properties
            this.width = layerData.width
            this.height = layerData.height
            this.data = layerData.data
        }
    }

    getObjects (): Entity[] {
        return this.objects
    }

    update (scene: Scene, delta: number): void {
        if (isValidArray(this.objects)) {
            for (const obj of this.objects) {
                if (obj.isActive(scene)) {
                    obj.collided = []
                    this.objects.forEach(
                        (activeObj) => activeObj.id !== obj.id && activeObj.overlapTest(obj, scene)
                    )
                    obj.update && obj.update(scene, delta)
                    obj.dead && this.removeObject(obj)
                }
            }
        }
    }

    draw (ctx: CanvasRenderingContext2D, scene: Scene): void {
        if (this.visible) {
            switch (this.type) {
            case NODE_TYPE.LAYER:
                scene.forEachVisibleTile(this.id, (tile, x, y) => {
                    tile.draw(ctx, x, y)
                    if (scene.debug) {
                        tile.collisionMasks.map((cm) => {
                            ctx.lineWidth = 0.1
                            stroke(ctx)(x, y, cm.points, COLORS.WHITE_30)
                            fillText(ctx)(`${tile.id}`, x + 2, y + 6, COLORS.WHITE_30)
                        })
                    }
                })
                break
            case NODE_TYPE.OBJECT_GROUP:
                scene.forEachVisibleObject(this.id, (obj) => obj.draw(ctx, scene))
                break
            }
            // @todo: handle image layer
        }
    }

    isInRange (x: number, y: number): boolean {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.width &&
            y < this.height
        )
    }

    get (x: number, y: number): number {
        return this.isInRange(x, y) && this.data[x + this.width * y] 
    }

    put (x: number, y: number, tileId: number): void {
        if (this.isInRange(x, y)) {
            this.data[x + this.width * y] = tileId
        }
    }

    clear (x: number, y: number): void {
        if (this.isInRange(x, y)) {
            this.data[x + this.width * y] = null
        }
    }

    addObject (obj: Entity, index = null): void {
        index !== null
            ? this.objects.splice(index, 0, obj)
            : this.objects.push(obj)
    }

    removeObject (obj: Entity): void {
        this.objects.splice(this.objects.indexOf(obj), 1)
    }

    toggleVisibility (toggle: number): void {
        this.visible = toggle
    }
}
