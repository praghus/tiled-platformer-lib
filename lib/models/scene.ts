
import { getFilename, isValidArray, noop, fillText } from '../helpers'
import { TmxMap, Constructable, TmxObject, TmxTileset, StringTMap, TmxLayer } from 'tiled-platformer-lib'
import { Camera, Entity, Input, Layer, Sprite, Tile, Viewport } from '../index'
import { COLORS } from '../constants'

export class Scene {
    public camera: Camera
    public input: Input
    public entities: StringTMap<any> = {}
    public layers: Layer[] = []
    public tiles: StringTMap<Tile> = {}
    public timeoutsPool: Record<string, any> = {}
    public map: TmxMap
    public currentCameraId: number
    public shadowCastingLayerId: number
    public debug = false

    constructor ( 
        public images: StringTMap<HTMLImageElement>,
        public viewport: Viewport,
        public properties: StringTMap<any> = {}
    ) {
        this.camera = new Camera(viewport)
        this.resize(viewport)
    }

    /**
     * Update handler
     * @param time 
     * @param input 
     */
    public update (delta: number, input?: Input): void {
        this.input = input
        for (const layer of this.layers) {
            layer instanceof Layer && layer.update(this, delta)
        }
        this.camera.update()
    }

    /**
     * Draw handler
     * @param ctx 
     */
    public draw (ctx: CanvasRenderingContext2D): void {
        const { resolutionX, resolutionY, scale } = this.viewport
        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)
        for (const layer of this.layers) {
            layer instanceof Layer && layer.draw(ctx, this)
        }
        if (this.debug) {
            const text = fillText(ctx)
            text('CAMERA', 4, 8, COLORS.WHITE)
            text(`x:${Math.floor(this.camera.x)}`, 4, 12)
            text(`y:${Math.floor(this.camera.y)}`, 4, 16)
        }
        ctx.restore()
    }

    /**
     * Add new layer
     * @param layer 
     * @param index 
     */
    public addLayer (layer: Layer, index?: number): Layer {
        if (layer instanceof Layer) {
            Number.isInteger(index)
                ? this.layers.splice(index, 0, layer)
                : this.layers.push(layer)
            return layer
        }
        else throw new Error('Invalid Layer!')
    }

    // @todo: refactor sprite+gid
    public addObject (entity: Entity, index?: number): void {
        entity.sprite = entity.image || entity.gid 
            ? entity.gid
                ? this.createTile(entity.gid)
                : this.createSprite(entity.image, entity.width, entity.height)
            : null
        this.getLayer(entity.layerId).addObject(entity, index)
    }
    
    public createTmxMap (data: TmxMap, entities: StringTMap<any>): void {
        this.map = data
        this.entities = entities
        this.camera.setBounds(0, 0, data.width * data.tilewidth, data.height * data.tileheight)
        data.layers.map((layerData) => layerData && this.createTmxLayer(layerData))
    }
    

    public createTmxLayer (tmxLayer: TmxLayer): void {
        this.layers.push(new Layer(tmxLayer))
        if (tmxLayer.data) {
            tmxLayer.data.forEach((gid) => gid > 0 && this.createTile(gid))
        }
        else if (tmxLayer.objects) {
            tmxLayer.objects.forEach((obj) => this.createObject(obj, tmxLayer.id))
        }
    }

    public createTile (id: number): Tile {
        if (!this.tiles[id]) {
            const tileset = this.getTileset(id)
            const image = this.images[getFilename(tileset.image.source)]
            this.tiles[id] = new Tile(id, image, tileset)
        }
        return this.tiles[id]
    }

    public createObject (obj: TmxObject, layerId: number): void {
        const Model = this.entities[obj.type] || Entity
        if (Model) {
            this.addObject(new Model({ layerId, ...obj }), layerId)
        }
    }

    public onScreen (object: Entity): boolean {
        const {
            camera,
            viewport: { resolutionX, resolutionY },
            map: { tilewidth, tileheight }
        } = this

        const { bounds, radius } = object
        const { x, y, w, h } = bounds

        if (radius) {
            const cx = object.x + x + w / 2
            const cy = object.y + y + h / 2
            return (
                cx + radius > -camera.x &&
                cy + radius > -camera.y &&
                cx - radius < -camera.x + resolutionX &&
                cy - radius < -camera.y + resolutionY
            )
        }
        else {
            const cx = object.x + x
            const cy = object.y + y
            return (
                cx + w + tilewidth > -camera.x &&
                cy + h + tileheight > -camera.y &&
                cx - tilewidth < -camera.x + resolutionX &&
                cy - tileheight < -camera.y + resolutionY
            )
        }
    }

    public isSolidArea (x: number, y: number, layers: number[]): boolean {
        return !!layers.map((layerId) => {
            const tile = this.getTile(x, y, layerId)
            return tile && tile.isSolid()
        }).find((isTrue) => !!isTrue)
    }

    public forEachVisibleObject (layerId: number, fn: (obj: Entity) => void = noop): void {
        for (const obj of this.getLayer(layerId).objects) {
            obj.visible && obj.isActive(this) && fn(obj)
        }
    }

    public forEachVisibleTile (layerId: number, fn: (tile: Tile, x: number, y: number) => void = noop): void {
        const { 
            camera,
            map: { tilewidth, tileheight },
            viewport: { resolutionX, resolutionY }
        } = this
        let y = Math.floor(camera.y % tileheight)
        let _y = Math.floor(-camera.y / tileheight)
        while (y < resolutionY) {
            let x = Math.floor(camera.x % tilewidth)
            let _x = Math.floor(-camera.x / tilewidth)
            while (x < resolutionX) {
                const tileId = this.getLayer(layerId).get(_x, _y)
                tileId && fn(this.getTileObject(tileId), x, y)
                x += tilewidth
                _x++
            }
            y += tileheight
            _y++
        }
    }
    
    public checkTimeout = (name: string): boolean => this.timeoutsPool[name] ? true : false
    

    public startTimeout (name: string, duration: number, fn?: () => void): void {
        if (!this.timeoutsPool[name]) {
            this.timeoutsPool[name] = setTimeout(() => {
                this.stopTimeout(name)
                typeof fn === 'function' && fn()
            }, duration)
        }
    }

    public stopTimeout (name: string): void {
        if (this.timeoutsPool[name] !== null) {
            clearTimeout(this.timeoutsPool[name])
            this.timeoutsPool[name] = null
        }
    }


    // @todo: consider move to helpers
    public createCustomLayer = (Layer: Constructable<Layer>, index?: number): Layer => this.addLayer(new Layer(this), index)
    public createSprite = (id: string, width: number, height: number): Sprite => new Sprite(id, this.images[id], width, height)
    public setProperty = (name: string, value: any): void => this.properties[name] = value 
    public getProperty = (name: string): any => this.properties[name]
    public getMapProperty = (name: string): any => this.map.properties && this.map.properties[name]
    public getObjects = (layerId: number): Entity[] => this.getLayer(layerId).getObjects()
    public getObjectById = (id: string, layerId: number): Entity => this.getObjects(layerId).find((object) => object.id === id)
    public getObjectByType = (type: string, layerId: number): Entity => this.getObjects(layerId).find((object) => object.type === type)
    public getObjectsByType = (type: string, layerId: number): Entity[] => this.getObjects(layerId).filter((object) => object.type === type)
    public getObjectByProperty = (key: string, value: any, layerId: number): Entity => this.getObjects(layerId).find(({ properties }) => properties && properties[key] === value)
    public getObjectLayers = (): Layer[] => this.layers.filter((layer: Layer) => isValidArray(layer.objects))
    public getLayer = (id: number): Layer => this.layers.find((layer) => layer.id === id)
    public getTileset = (tileId: number): TmxTileset => this.map.tilesets.find(({ firstgid, tilecount }) => tileId + 1 >= firstgid && tileId + 1 <= firstgid + tilecount)
    public getTile = (x: number, y: number, layerId: number): Tile => this.getTileObject(this.getLayer(layerId).get(x, y))
    public getTileObject = (gid: number): Tile => this.tiles[gid] || null
    public resize = (viewport: Viewport): void => this.camera && this.camera.resize(viewport)
    public removeLayer = (index: number): void => { this.layers.splice(index, 1) }
    public removeTile = (x: number, y: number, layerId: number): void => this.getLayer(layerId).clear(x, y)
    public showLayer = (layerId: number): void => this.getLayer(layerId).toggleVisibility(1)
    public hideLayer = (layerId: number): void => this.getLayer(layerId).toggleVisibility(0)
}
