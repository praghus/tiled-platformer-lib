import { NODE_TYPE } from '../constants'
import { createPolygonObject, isValidArray } from '../helpers'

export default class Layer {
    constructor (layerData, game) {
        const { 
            id, name, data, objects, width, height, type, visible, properties
        } = layerData
        
        this.id = id 
        this.game = game
        this.name = name || ''
        this.type = type || NODE_TYPE.CUSTOM
        this.visible = visible === undefined ? true : visible 
        this.properties = properties
        this.width = width
        this.height = height

        this.data = []
        this.objects = []
        this.activeObjectsCount = 0
        
        if (data) {
            this.data = data 
            this.data.map((gid) => gid > 0 && game.scene.createTile(gid))
        }
        else if (objects) {
            objects.map((obj) => this.addObject(obj))
        }
    }

    update () {
        if (isValidArray(this.objects)) {
            const { scene } = this.game
            this.activeObjectsCount = 0
            this.objects.map((obj) => {
                if (obj.onScreen()) {
                    this.objects.map((activeObj) => activeObj.id !== obj.id && activeObj.overlapTest(obj))

                    if (obj.light && obj.visible) scene.addLight(obj.getLight())
                    if (obj.shadowCaster && obj.visible) scene.addLightMask(...obj.getLightMask())
                    
                    obj.update && obj.update()
                    obj.dead && this.removeObject(obj)
                    this.activeObjectsCount++
                }
            })
        }
    }

    draw () {
        if (this.visible) {
            switch (this.type) {
            case NODE_TYPE.LAYER:
                this.renderTileLayer()
                break
            case NODE_TYPE.OBJECT_GROUP:
                this.objects.map((obj) => obj.draw())
                break
            }
            // @todo: handle image layer
        }
    }

    renderTileLayer () {
        const { camera, scene } = this.game
        const {
            resolutionX, 
            resolutionY,
            map: { 
                tilewidth, 
                tileheight 
            } 
        } = scene
           
        let y = Math.floor(camera.y % tileheight)
        let _y = Math.floor(-camera.y / tileheight)

        while (y < resolutionY) {
            let x = Math.floor(camera.x % tilewidth)
            let _x = Math.floor(-camera.x / tilewidth)
            while (x < resolutionX) {
                const tile = this.getTile(_x, _y)
                if (tile) {
                    // create shadow casters if necessary
                    if (this.id === scene.shadowCastingLayer && tile.isShadowCaster()) {
                        tile.collisionMask.map(({ points }) => scene.addLightMask(
                            createPolygonObject(x, y, points)
                        ))
                    }
                    tile.draw(x, y + (tileheight - tile.height))
                }
                x += tilewidth
                _x++
            }
            y += tileheight
            _y++
        }
    }

    getTile (x, y) {    
        if (this.isInRange(x, y)) {
            const gid = this.data[x + this.width * y]
            return this.game.scene.getTileObject(gid)
        }
        return null
    }

    putTile (x, y, tileId) {
        if (this.isInRange(x, y)) {
            this.game.scene.createTile(tileId)
            this.data[x + this.width * y] = tileId
        }
    }

    clearTile (x, y) {
        if (this.isInRange(x, y)) {
            this.data[x + this.width * y] = null
        }
    }    

    addObject (obj, index = null) {
        const { entities } = this.game.scene
        try {
            const entity = isValidArray(entities) && entities.find(
                ({type}) => type === obj.type
            )
            if (entity) {
                const Entity = entity.model
                const newModel = new Entity(
                    { layerId: this.id, ...obj, ...entity }, this.game
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

    removeObject (obj) {
        this.objects.splice(this.objects.indexOf(obj), 1)
    }

    isInRange (x, y) {
        return (
            x >= 0 && 
            y >= 0 && 
            x < this.width && 
            y < this.height
        )
    }
}
