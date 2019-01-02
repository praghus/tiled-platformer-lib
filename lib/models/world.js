import { LAYER_TYPE } from '../constants'
export default class World {
    constructor (data, config, scene) {
        const { layers, height, properties, width, tilesets, tilewidth } = data
        const { entities, gravity, nonColideTiles, oneWayTiles } = config
        
        this._scene = scene
        this.layers = []
        this.objectsPool = {}

        // config
        this.entities = entities || []
        this.gravity = gravity || 1
        this.oneWayTiles = oneWayTiles || []
        this.nonColideTiles = nonColideTiles || []

        // properties
        this.width = width
        this.height = height
        this.surface = properties.surfaceLevel || this.height 
        this.spriteSize = tilewidth
        this.tilesets = tilesets

        layers.map(({ id, name, data, objects, type, visible, properties }) => {
            const layer = { id, name, type, visible, properties }
            if (data) {
                layer.data = [...Array(width).keys()].map(() => Array(height))
                let j = 0
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        layer.data[x][y] = data[j]
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
                    if (layer.properties.collide) { // @todo: move collision detection into entity
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
                case LAYER_TYPE.TILE_LAYER: 
                    this.renderTileLayer(layer.id)
                    break
                case LAYER_TYPE.OBJECT_LAYER: 
                    layer.objects.map((obj) => obj.draw())
                    break
                }
            }
        })
    }

    renderTileLayer (id) {
        const { ctx, assets, camera, viewport: { resolutionX, resolutionY } } = this._scene
        const { spriteSize } = this

        let y = Math.floor(camera.y % spriteSize)
        let _y = Math.floor(-camera.y / spriteSize)

        while (y < resolutionY) {
            let x = Math.floor(camera.x % spriteSize)
            let _x = Math.floor(-camera.x / spriteSize)
            while (x < resolutionX) {
                const tile = this.getTile(_x, _y, id)

                if (tile > 0) {
                    const {columns, name, firstgid /*, image*/} = this.getAssetForTile(tile)   
                    ctx.drawImage(assets[name], // @todo: take from tilesets
                        ((tile - firstgid) % columns) * spriteSize,
                        (Math.ceil(((tile - firstgid) + 1) / columns) - 1) * spriteSize,
                        spriteSize, spriteSize, x, y,
                        spriteSize, spriteSize)
                }
                x += spriteSize
                _x++
            }
            y += spriteSize
            _y++
        }
    }

    showLayer (layerId) {
        this.getLayer(layerId).visible = true
    }

    hideLayer (layerId) {
        this.getLayer(layerId).visible = false
    }

    getAssetForTile (tile) {
        return this.tilesets.find(({firstgid, tilecount}) => tile >= firstgid && tile <= firstgid + tilecount)
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
                    }, this._scene)
                }
            }
            return null
        }
        catch (e) {
            throw (e)
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
        // this.modifiers.push({id, x, y, value})
    }

    // tileData (x, y, layerId = this.mainLayerId) {
    //     const type = this.getTile(x, y, layerId)
    //     return {
    //         type,
    //         x: this.spriteSize * x,
    //         y: this.spriteSize * y,
    //         width: this.spriteSize,
    //         height: this.spriteSize,
    //         solid: type > 256, // this.isSolidTile(type),
    //         oneway: false //this.isOneWayTile(type)
    //     }
    // }

    isSolidTile (tile) {
        return tile > 0 && this.nonColideTiles.indexOf(tile) === -1
    }

    isOneWayTile (tile) {
        return tile > 0 && this.oneWayTiles.indexOf(tile) !== -1
    }
    
    isSolidArea (x, y) {
        return !this.inRange(x,y) || !!this.getTilledCollisionLayers().map(
            (layer) => this.isSolidTile(layer.data[x][y])
        ).find((isTrue) => !!isTrue)
    }
    
    isOneWayArea (x, y) {
        return !!this.getTilledCollisionLayers().map(
            (layer) => this.isOneWayTile(layer.data[x][y])    
        ).find((isTrue) => !!isTrue)
    }

    isCollisionLayer (layer) {
        const { properties } = layer 
        return properties ? !!properties.collide : true
    }

    getTilledCollisionLayers () {
        return this.layers.filter(
            (layer) => layer.type === 'tilelayer' && this.isCollisionLayer(layer)
        ) || []
    }

    clearTile (x, y, layerId) {
        if (this.inRange(x, y)) {
            this.getLayer(layerId).data[x][y] = null
            // this.modifiers.push({id, x, y, value: null})
        }
    }
}
