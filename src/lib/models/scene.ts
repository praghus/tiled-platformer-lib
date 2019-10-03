import { EntityModel, TmxMap, Viewport, Constructable, TmxObject, TmxTileset, StringTMap } from 'tiled-platformer-lib'
import { isValidArray, noop } from '../helpers'
import { Camera } from './camera'
import { Entity } from './entity'
import { Layer } from './layer'
import { LightLayer } from './light-layer'
import { Sprite } from './sprite'
import { Tile } from './tile'

export class Scene implements Scene {
    public assets: StringTMap<HTMLImageElement> = {}
    public camera: Camera
    public entities: EntityModel[] = []
    public layers: Layer[] = []
    public lights: any[] = []
    public lightmask: any[] = []
    public timeoutsPool: StringTMap<any> = {}
    public properties: StringTMap<any> = {}
    public sprites: StringTMap<Sprite> = {}
    public tiles: StringTMap<Tile> = {}
    public map: TmxMap
    public player: Entity
    public currentCameraId: number
    public shadowCastingLayerId: number
    public gravity: number
    public width: number
    public height: number
    public resolutionX: number
    public resolutionY: number
    public scale: number
    public timer: number

    constructor ( 
        viewport: Viewport,
        props?: StringTMap<any>
    ) {
        if (props && Object.keys(props).length > 0) {
            Object.keys(props).map((k) => {
                this[k] = props[k]
            })
        }
        this.resize(viewport)
        this.camera = new Camera(this)
    }

    private _clear (): void {
        delete (this.lightmask)
        delete (this.lights)
        this.lightmask = []
        this.lights = []
    }

    resize (viewport: Viewport): void {
        this.width = viewport.width
        this.height = viewport.height
        this.scale = viewport.scale || 1
        this.resolutionX = Math.round(this.width / this.scale)
        this.resolutionY = Math.round(this.height / this.scale)
    }

    addAssets (assets: StringTMap<HTMLImageElement>) {
        this.assets = assets
    }

    addTmxMap (data: TmxMap, entities: EntityModel[]): void {
        this.entities = entities
        this.map = data
        data.layers.map(
            (layerData) => this.layers.push(new Layer(this, layerData))
        )
    }

    addPlayer (player: Entity, cameraFollow = true): void {
        this.player = player
        cameraFollow && this.camera.setFollow(this.player)
    }

    update (): void {
        if (!this.timer) this.timer = new Date().valueOf()
        this._clear()
        this.camera.update()
        this.layers.map((layer) => layer instanceof Layer && layer.update())
    }

    draw (ctx: CanvasRenderingContext2D): void {
        const { resolutionX, resolutionY, scale } = this
        ctx.imageSmoothingEnabled = false
        ctx.save()
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, resolutionX, resolutionY)
        this.layers.map((layer) => layer instanceof Layer && layer.draw(ctx))
        ctx.restore()
    }

    createSprite (id: string, props: Record<string, any>): Sprite {
        if (!this.sprites[id]) {
            this.sprites[id] = new Sprite(props, this)
        }
        return this.sprites[id]
    }

    createTile (id: number): Tile {
        if (!this.tiles[id]) {
            this.tiles[id] = new Tile(id, this)
        }
        return this.tiles[id]
    }

    addLight (light: any): void {
        this.lights.push(light)
    }

    addLightMask (lightMask: any): void {
        this.lightmask.push(lightMask)
    }

    setProperty (name: string, value: any): void {
        this.properties[name] = value
    }

    getProperty (name: string): any {
        return this.properties[name] || null
    }

    createShadowCastingLayer (layerId: number, index: number): void {
        this.shadowCastingLayerId = layerId
        this.addLayer(new LightLayer(this), index)
    }

    createCustomLayer (Layer: Constructable<Layer>, index: number): void {
        const newLayer = new Layer(this)
        this.addLayer(newLayer, index)
    }

    setGravity (gravity: number): void {
        this.gravity = gravity
    }

    addObject (obj: TmxObject, layerId: number, index: number): void {
        this.getLayer(layerId).addObject(obj, index)
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
        return this.getLayer(layerId).getTile(x, y)
    }

    getTileObject (gid: number): Tile {
        return this.tiles[gid] || null
    }

    putTile (x: number, y: number, tileId: number, layerId: number): void {
        this.getLayer(layerId).putTile(x, y, tileId)
    }

    clearTile (x: number, y: number, layerId: number): void {
        this.getLayer(layerId).clearTile(x, y)
    }

    isSolidArea (x: number, y: number, layers: number[]): boolean {
        return !!layers.map((layerId) => {
            const tile = this.getTile(x, y, layerId)
            return tile && tile.isSolid()
        }).find((isTrue) => !!isTrue)
    }

    setCameraViewport (viewObj: Entity): void {
        const { id, x, y, width, height } = viewObj
        if (this.currentCameraId !== id) {
            this.camera.setBounds(x, y, width, height)
            this.currentCameraId = id
        }
    }

    checkTimeout (name: string): any {
        return this.timeoutsPool[name] || null
    }

    startTimeout (name: string, duration: number, f = noop): void {
        if (!this.timeoutsPool[name]) {
            this.timeoutsPool[name] = setTimeout(() => {
                this.stopTimeout(name)
                f()
            }, duration)
        }
    }

    stopTimeout (name: string): void {
        if (this.timeoutsPool[name] !== null) {
            clearTimeout(this.timeoutsPool[name])
            this.timeoutsPool[name] = null
        }
    }
}
