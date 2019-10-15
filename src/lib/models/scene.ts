import { EntityModel, TmxMap, Viewport, Constructable, TmxObject, TmxTileset, StringTMap, TmxLayer, Input } from 'tiled-platformer-lib'
import { getFilename, isValidArray, noop } from '../helpers'
import { Camera } from './camera'
import { Entity } from './entity'
import { Layer } from './layer'
import { Sprite } from './sprite'
import { Tile } from './tile'

export class Scene implements Scene {
    public camera: Camera
    public entities: EntityModel[] = []
    public layers: Layer[] = []
    public tiles: StringTMap<Tile> = {}
    public map: TmxMap
    public player: Entity
    public currentCameraId: number
    public shadowCastingLayerId: number
    public width: number
    public height: number
    public resolutionX: number
    public resolutionY: number
    public scale: number
    public timer: number

    constructor ( 
        public assets: StringTMap<HTMLImageElement>,
        public viewport: Viewport,
        public properties?: StringTMap<any>
    ) {
        this.camera = new Camera(viewport)
        this.getProperty = this.getProperty.bind(this)
        this.setProperty = this.setProperty.bind(this)
        this.resize(viewport)
    }

    // Add input handling

    resize (viewport: Viewport): void {
        this.width = viewport.width
        this.height = viewport.height
        this.scale = viewport.scale || 1
        this.resolutionX = Math.round(this.width / this.scale)
        this.resolutionY = Math.round(this.height / this.scale)
        this.camera.resize(viewport)
    }

    addTmxMap (data: TmxMap, entities: EntityModel[]): void {
        this.map = data
        this.entities = entities
        this.camera.setBounds(0, 0, data.width * data.tilewidth, data.height * data.tileheight)
        data.layers.map((layerData) => this.createTmxLayer(layerData))
    }

    addPlayer (player: Entity, cameraFollow = true): void {
        this.player = player
        cameraFollow && this.camera.setFollow(this.player)
    }

    update (input: Input, time: number): void {
        for (const layer of this.layers) {
            layer instanceof Layer && layer.update(this, input, time)
        }
        this.camera.update()
        if (!this.timer) this.timer = new Date().valueOf()
    }

    draw (ctx: CanvasRenderingContext2D): void {
        const { resolutionX, resolutionY, scale } = this
        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)
        for (const layer of this.layers) {
            layer instanceof Layer && layer.draw(ctx, this)
        }
        ctx.restore()
    }

    onScreen (object: Entity): boolean {
        if (object.attached) return true
        const {
            camera,
            resolutionX,
            resolutionY,
            map: {
                tilewidth,
                tileheight
            }
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

    createSprite (id: string, width: number, height: number): Sprite {
        return new Sprite(id, this.assets[id], width, height)
    }

    createTile (id: number): Tile {
        if (!this.tiles[id]) {
            const tileset = this.getTileset(id)
            const asset = this.assets[getFilename(tileset.image.source)]
            this.tiles[id] = new Tile(id, asset, tileset)
        }
        return this.tiles[id]
    }

    clearTile (x: number, y: number, layerId: number): void {
        this.getLayer(layerId).clear(x, y)
    }

    createTmxLayer (tmxLayer: TmxLayer): void {
        this.layers.push(new Layer(tmxLayer))
        if (tmxLayer.data) {
            tmxLayer.data.forEach((gid) => gid > 0 && this.createTile(gid))
        }
        else if (tmxLayer.objects) {
            tmxLayer.objects.forEach((obj) => this.addObject(obj, tmxLayer.id))
        }
    }

    createCustomLayer (Layer: Constructable<Layer>, index: number): void {
        const newLayer = new Layer(this)
        this.addLayer(newLayer, index)
    }

    setProperty (name: string, value: any): void {
        this.properties[name] = value
    }

    getProperty (name: string): any {
        return this.properties[name]
    }

    addObject (obj: TmxObject, layerId: number, index?: number): void {
        const entity = isValidArray(this.entities) && this.entities.find(
            ({ type }) => type === obj.type
        )
        if (entity) {
            const Entity = entity.model
            const sprite = entity.aid || obj.gid 
                ? obj.gid
                    ? this.createTile(obj.gid)
                    : this.createSprite(entity.aid, obj.width, obj.height)
                : null
            const newModel = new Entity({ layerId, ...obj, ...entity }, sprite)
            this.getLayer(layerId).addObject(newModel, index)
        }
    }

    addLayer (layer: Layer, index?: number): void {
        if (layer instanceof Layer) {
            Number.isInteger(index)
                ? this.layers.splice(index, 0, layer)
                : this.layers.push(layer)
        }
        else throw new Error('Invalid Layer!')
    }

    removeLayer (index: number): void {
        this.layers.splice(index, 1)
    }

    showLayer (layerId: number): void {
        this.getLayer(layerId).toggleVisibility(1)
    }

    hideLayer (layerId: number): void {
        this.getLayer(layerId).toggleVisibility(0)
    }

    getMapProperty (name: string): any {
        return this.map.properties && this.map.properties[name]
    }

    getObjects (layerId: number): Entity[] {
        return this.getLayer(layerId).getObjects()
    }

    getObjectById (id: number, layerId: number): Entity {
        return this.getObjects(layerId).find((object) => object.id === id)
    }

    getObjectByType (type: string, layerId: number): Entity {
        return this.getObjects(layerId).find((object) => object.type === type)
    }

    getObjectByProperty (key: string, value: any, layerId: number): Entity {
        return this.getObjects(layerId).find(
            ({ properties }) => properties && properties[key] === value
        )
    }

    getObjectLayers (): Layer[] {
        return this.layers.filter((layer) => isValidArray(layer.objects))
    }

    getLayer (id: number): Layer {
        return this.layers.find((layer) => layer.id === id)
    }

    getTileset (tileId: number): TmxTileset {
        return this.map.tilesets.find(({ firstgid, tilecount }) =>
            tileId + 1 >= firstgid && tileId + 1 <= firstgid + tilecount
        )
    }

    getTile (x: number, y: number, layerId: number): Tile {
        const tileId = this.getLayer(layerId).get(x, y)
        return this.getTileObject(tileId)
    }

    getTileObject (gid: number): Tile {
        return this.tiles[gid] || null
    }

    putTile (x: number, y: number, tileId: number, layerId: number): void {
        this.createTile(tileId)
        this.getLayer(layerId).put(x, y, tileId)
    }

    isSolidArea (x: number, y: number, layers: number[]): boolean {
        return !!layers.map((layerId) => {
            const tile = this.getTile(x, y, layerId)
            return tile && tile.isSolid()
        }).find((isTrue) => !!isTrue)
    }

    forEachVisibleObject (layerId: number, fn: (obj: Entity) => void = noop): void {
        for (const obj of this.getLayer(layerId).objects) {
            obj.visible && this.onScreen(obj) && fn(obj)
        }
    }

    forEachVisibleTile (layerId: number, fn: (tile: Tile, x: number, y: number) => void = noop): void {
        const { 
            camera, resolutionX, resolutionY, 
            map: { tilewidth, tileheight } 
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
}
