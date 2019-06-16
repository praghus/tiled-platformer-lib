import { NODE_TYPE } from '../constants'
import { getFilename } from '../helpers'
import Tile from './tile'

export default class World {
    constructor (data, config, game) {
        const { 
            layers, 
            height, 
            properties, 
            width, 
            tilesets, 
            tilewidth 
        } = data
        
        const {
            entities, 
            gravity, 
            nonColideTiles, 
            oneWayTiles 
        } = config
        
        this.game = game
        this.layers = []
        this.objectsPool = {}
        this.tiles = {}
        this.properties = properties


        // config
        this.entities = entities || []
        this.gravity = gravity || 1
        this.oneWayTiles = oneWayTiles || []
        this.nonColideTiles = nonColideTiles || []

        // properties
        this.width = width
        this.height = height
        this.spriteSize = tilewidth
        this.tilesets = tilesets

        layers.map(({ id, name, data, objects, type, visible, properties }) => {
            const layer = { id, name, type, visible, properties }
            if (data) {
                layer.data = [...Array(width).keys()].map(() => Array(height))
                let j = 0
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const tileId = data[j]
                        this.createTile(tileId)
                        layer.data[x][y] = tileId
                        j++
                    }
                }
            }
            else if (objects) {
                layer.objects = []
                objects.map((obj) => {
                    const entity = this.createObject(obj, layer.id)
                    entity && layer.objects.push(entity)
                })
            }
            this.layers.push(layer)
        })
    }

    update () {
        this.getObjectLayers().map((layer) => {
            layer.objects.map((obj, index) => {
                if (!obj.dead) {
                    if (this.isCollisionLayer(layer)) { 
                        for (let k = index + 1; k <  layer.objects.length; k++) {
                            obj.overlapTest(layer.objects[k])
                        }
                    }
                    obj.update && obj.update() 
                }
                else this.removeObject(obj)
            })
        })
    }

    draw () {
        this.layers.map((layer) => {
            if (layer.visible) {
                switch (layer.type) {
                case NODE_TYPE.LAYER: 
                    this.renderTileLayer(layer.id)
                    break
                case NODE_TYPE.OBJECT_GROUP: 
                    layer.objects.map((obj) => obj.draw())
                    break
                }
            }
            else if (typeof layer === 'function') {
                layer()
            }
        })
    }

    renderTileLayer (layerId) {
        const { spriteSize } = this
        const { 
            ctx, 
            camera, 
            props: {
                viewport: { 
                    resolutionX, 
                    resolutionY 
                } 
            }
        } = this.game

        let y = Math.floor(camera.y % spriteSize)
        let _y = Math.floor(-camera.y / spriteSize)

        while (y < resolutionY) {
            let x = Math.floor(camera.x % spriteSize)
            let _x = Math.floor(-camera.x / spriteSize)
            while (x < resolutionX) {
                const tile = this.getTile(_x, _y, layerId)
                if (tile > 0) {
                    this.tiles[tile].draw(x, y, ctx)
                }
                x += spriteSize
                _x++
            }
            y += spriteSize
            _y++
        }
    }

    addLayer (layer, index) {
        this.layers.splice(index, 0, layer)
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

    getProperty (name) {
        return this.properties && this.properties[name]
    }

    getTileset (tile) {
        return this.tilesets.find(
            ({firstgid, tilecount}) => tile >= firstgid && tile <= firstgid + tilecount
        )
    }

    createObject (obj, layerId) {
        try {
            const entity = this.entities.filter(({type}) => type === obj.type)[0] || null
            if (entity) {
                // first check if there are some objects of the same type in objectsPool
                if (this.objectsPool[obj.type] && this.objectsPool[obj.type].length) {
                    const storedObj = this.objectsPool[obj.type].pop()
                    storedObj.restore()
                    Object.keys(obj).map((prop) => {
                        storedObj[prop] = obj[prop]
                    })
                    return storedObj
                }
                else {
                    const Model = entity.model
                    return new Model({ 
                        layerId,
                        ...obj,
                        ...entity
                    }, this.game)
                }
            }
            return null
        }
        catch (e) {
            throw (e)
        }
    }

    createTile (tileId) {
        const { props: { assets } } = this.game
        const tileset = this.getTileset(tileId)
        if (!this.tiles[tileId] && tileId) {
            const filename = getFilename(tileset.image.source)
            this.tiles[tileId] = new Tile(tileId, {
                asset: assets[filename],
                tileset
            })
        }
    }

    addObject (obj, layerId) {
        const entity = this.createObject(obj, layerId)
        entity && this.getObjects(layerId).push(entity)
    }

    removeObject (obj) {
        const { layerId, type } = obj
        const objectLayer = this.getObjects(layerId)
        // move deleted object to objectsPool 
        // to reduce garbage collection and stuttering
        if (!this.objectsPool[type]) {
            this.objectsPool[type] = []
        }
        this.objectsPool[type].push(obj)
        objectLayer.splice(objectLayer.indexOf(obj), 1)
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

    // getAllObjects () {
    //     return [].concat.apply([], this.getObjectLayers()).map(({objects}) => objects)
    // }

    getObjectLayers () {
        return this.layers.filter((layer) => layer.objects && layer.objects.length > 0)
    }

    inRange (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height
    }

    getLayer (id) {
        return this.layers.find((layer) => layer.id === id)
    }

    getTile (x, y, layerId) {
        return this.inRange(x, y) && this.getLayer(layerId).data[x][y]
    }

    putTile (x, y, value, layerId) {
        if (!this.inRange(x, y)) return false
        this.getLayer(layerId).data[x][y] = value
    }

    isSolidTile (tile) {
        return tile > 0 && this.nonColideTiles.indexOf(tile) === -1
    }

    isOneWayTile (tile) {
        return tile > 0 && this.oneWayTiles.indexOf(tile) !== -1
    }
     
    isSolidArea (x, y) {
        if (this.inRange(x, y)) {
            return !this.inRange(x, y) || !!this.getTilledCollisionLayers().map(
                (layer) => this.isSolidTile(layer.data[x][y])
            ).find((isTrue) => !!isTrue)
        }
    }
    
    isOneWayArea (x, y) {
        if (this.inRange(x, y)) {
            return !!this.getTilledCollisionLayers().map(
                (layer) => this.isOneWayTile(layer.data[x][y])    
            ).find((isTrue) => !!isTrue)
        }
    }

    isCollisionLayer (layer) {
        const { properties } = layer 
        return properties ? !!properties.collide : false
    }

    getTilledCollisionLayers () {
        return this.layers.filter(
            (layer) => layer.type === 'layer' && this.isCollisionLayer(layer)
        ) || []
    }

    clearTile (x, y, layerId) {
        if (this.inRange(x, y)) {
            this.getLayer(layerId).data[x][y] = null
        }
    }
}
