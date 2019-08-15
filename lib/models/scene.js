import { IlluminatedLayer } from './illuminated'
import { isValidArray } from '../helpers'
import Sprite from './sprite'
import Layer from './layer'

export default class Scene {
    constructor (game, { viewport, assets }) {
        this.activeObjects = []
        this.assets = assets
        this.entities = []
        this.dynamicLights = false
        this.game = game
        this.gravity = 1
        this.height = null
        this.layers = []
        this.lights = []
        this.lightmask = []
        this.map = null
        this.objectsPool = {}
        this.resolutionX = null
        this.resolutionY = null
        this.scale = 1 
        this.shadowCastingLayer = null
        this.sprites = {}
        this.tiles = {}
        this.width = null

        this.resize(viewport)
    }

    resize (viewport) {
        const { 
            width,
            height, 
            resolutionX, 
            resolutionY, 
            scale 
        } = viewport

        this.width = width
        this.height = height
        this.resolutionX = resolutionX || width
        this.resolutionY = resolutionY || height
        this.scale = scale || 1 
    }

    addTmxMap (data, entities) {
        const { layers } = data
        this.entities = entities
        this.map = data
        layers.map(
            (layer) => this.addLayer(new Layer(layer, this.game))
        )
    }

    update () {
        this.clear()
        this.layers.map(
            (layer) => layer instanceof Layer && layer.update()
        )
    }

    draw () {
        this.layers.map(
            (layer) => layer instanceof Layer && layer.draw() 
        )
    }

    createSprite (id, props) {
        if (!this.sprites[id]) { 
            this.sprites[id] = new Sprite(props, this.game)
        }
        return this.sprites[id]
    }

    addLight (light) {
        this.lights.push(light)
    }

    addLightMask (lightMask) {
        this.lightmask.push(lightMask)
    }

    toggleDynamicLights (toggle) {
        this.dynamicLights = toggle
    }

    setShadowCastingLayer (layerId, index) {
        this.shadowCastingLayer = layerId
        this.addLayer(new IlluminatedLayer(this.game), index)
    }

    setGravity (gravity) {
        this.gravity = gravity
    }

    addObject (obj, layerId, index) {
        return this.getLayer(layerId).addObject(obj, index)
    }

    addLayer (layer, index = null) {
        if (layer instanceof Layer) {
            index !== null
                ? this.layers.splice(index, 0, layer)
                : this.layers.push(layer)
        }
        else throw new Error('Invalid Layer!')
    }

    removeLayer (index) {
        this.layers.splice(index, 1)
    }

    showLayer (layerId) {
        this.getLayer(layerId).visible = true
    }

    hideLayer (layerId) {
        this.getLayer(layerId).visible = false
    }

    getMapProperty (name) {
        return this.map.properties && this.map.properties[name]
    }

    getObjects (layerId) {
        return this.getLayer(layerId).objects
    }

    getObjectById (id, layerId) {
        return this.getObjects(layerId).find((object) => object.id === id)
    }

    getObjectByType (type, layerId) {
        return this.getObjects(layerId).find((object) => object.type === type)
    }

    getObjectByProperty (key, value, layerId) {
        return this.getObjects(layerId).find(({properties}) => properties && properties[key] === value)
    }

    getObjectLayers () {
        return this.layers.filter((layer) => isValidArray(layer.objects))
    }

    getLayer (id) {
        return this.layers.find((layer) => layer.id === id)
    }

    getTileset (tile) {
        return this.map.tilesets.find(
            ({firstgid, tilecount}) => tile + 1 >= firstgid && tile + 1 <= firstgid + tilecount
        )
    }

    getTile (x, y, layerId) {
        return this.getLayer(layerId).getTile(x, y)
    }

    putTile (x, y, tileId, layerId) {
        return this.getLayer(layerId).putTile(x, y, tileId)
    }

    clearTile (x, y, layerId) {
        return this.getLayer(layerId).clearTile(x, y)
    }

    isSolidArea (x, y, layers = []) {
        return !!layers.map((layerId) => {
            const tile = this.getTile(x, y, layerId)
            return tile && tile.isSolid()
        }).find((isTrue) => !!isTrue)
    }

    clear () {
        delete (this.lightmask)
        delete (this.lights)
        this.lightmask = []
        this.lights = []
    }
}
