import { Scene, TmxLayer, TmxObject, Tile } from 'tiled-platformer-lib'
import { createPolygonObject, isValidArray } from '../helpers'
import { NODE_TYPE } from '../constants'
import { Entity } from './entity'

export class Layer {
    public id: number
    public name: string
    public type: string = NODE_TYPE.CUSTOM
    public properties: Record<string, any> = {}
    public activeObjectsCount: number
    public width: number
    public height: number
    public visible: number
    public data: number[] = []
    public objects: any[] = []

    constructor (public scene: Scene, layerData?: TmxLayer) {
        if (layerData) {
            this.id = layerData.id
            this.name = layerData.name || ''
            this.type = layerData.type || NODE_TYPE.CUSTOM
            this.visible = layerData.visible === undefined ? 1 : layerData.visible
            this.properties = layerData.properties
            this.width = layerData.width
            this.height = layerData.height

            if (layerData.data) {
                this.data = layerData.data
                this.data.map((gid) => gid > 0 && this.scene.createTile(gid))
            }
            else if (layerData.objects) {
                layerData.objects.map((obj) => this.addObject(obj))
            }
        }
    }

    getObjects (): Entity[] {
        return this.objects
    }

    update (): void {
        if (isValidArray(this.objects)) {
            this.activeObjectsCount = 0
            this.objects.map((obj) => {
                if (obj.onScreen()) {
                    this.objects.map((activeObj) => activeObj.id !== obj.id && activeObj.overlapTest(obj))

                    if (obj.light && obj.visible) this.scene.addLight(obj.getLight())
                    if (obj.shadowCaster && obj.visible) this.scene.addLightMask(...obj.getLightMask())

                    obj.update && obj.update()
                    obj.dead && this.removeObject(obj)
                    this.activeObjectsCount++
                }
            })
        }
    }

    draw (ctx: CanvasRenderingContext2D): void {
        if (this.visible) {
            switch (this.type) {
            case NODE_TYPE.LAYER:
                this.renderTileLayer(ctx)
                break
            case NODE_TYPE.OBJECT_GROUP:
                this.objects.map((obj) => obj.draw(ctx))
                break
            }
            // @todo: handle image layer
        }
    }

    renderTileLayer (ctx: CanvasRenderingContext2D): void {
        const {
            camera,
            resolutionX,
            resolutionY,
            map: {
                tilewidth,
                tileheight
            }
        } = this.scene

        let y = Math.floor(camera.y % tileheight)
        let _y = Math.floor(-camera.y / tileheight)

        while (y < resolutionY) {
            let x = Math.floor(camera.x % tilewidth)
            let _x = Math.floor(-camera.x / tilewidth)
            while (x < resolutionX) {
                const tile = this.getTile(_x, _y)
                if (tile) {
                    // create shadow casters if necessary
                    if (this.id === this.scene.shadowCastingLayerId && tile.isShadowCaster()) {
                        tile.collisionMask.map(({ points }) => this.scene.addLightMask(
                            createPolygonObject(x, y, points)
                        ))
                    }
                    tile.draw(ctx, x, y + (tileheight - tile.height))
                }
                x += tilewidth
                _x++
            }
            y += tileheight
            _y++
        }
    }

    getTile (x: number, y: number): Tile {
        if (this.isInRange(x, y)) {
            const gid = this.data[x + this.width * y]
            return this.scene.getTileObject(gid)
        }
        return null
    }

    putTile (x: number, y: number, tileId: number): void {
        if (this.isInRange(x, y)) {
            this.scene.createTile(tileId)
            this.data[x + this.width * y] = tileId
        }
    }

    clearTile (x: number, y: number): void {
        if (this.isInRange(x, y)) {
            this.data[x + this.width * y] = null
        }
    }

    addObject (obj: TmxObject, index = null): void {
        const { entities } = this.scene
        try {
            const entity = isValidArray(entities) && entities.find(
                ({ type }) => type === obj.type
            )
            if (entity) {
                const Entity = entity.model
                const newModel = new Entity(
                    { layerId: this.id, ...obj, ...entity }, this.scene
                )
                index !== null
                    ? this.objects.splice(index, 0, newModel)
                    : this.objects.push(newModel)
            }
        }
        catch (e) {
            throw (e)
        }
    }

    removeObject (obj: Entity): void {
        this.objects.splice(this.objects.indexOf(obj), 1)
    }

    toggleVisibility (toggle: number): void {
        this.visible = toggle
    }

    isInRange (x: number, y: number): boolean {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.width &&
            y < this.height
        )
    }
}
