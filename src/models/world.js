import { getProperties } from '../helpers'

export default class World {
    constructor (data, config) {
        const { layers, height, properties, width, tilesets, tilewidth } = data
        const { gravity, surfaceLevel } = getProperties(properties)
        const { entities, mainLayer, nonColideIndex, jumpThroughTiles } = config

        this.width = parseInt(width)
        this.height = parseInt(height)
        this.gravity = parseFloat(gravity)
        this.surface = parseInt(surfaceLevel)
        this.spriteSize = parseInt(tilewidth)
        this.spriteCols = parseInt(tilesets[0].columns)

        this.entities = entities || []
        this.jumpThroughTiles = jumpThroughTiles || []
        this.mainLayer = mainLayer
        this.nonColideIndex = nonColideIndex || 0

        this.modifiers = []
        this.renderOrder = []
        this.objects = []
        this.layers = {}

        layers.map(({name, data, objects}) => {
            this.renderOrder.push(name)
            if (data) {
                this.layers[name] = [...Array(width).keys()].map(() => Array(height))
                let j = 0
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const tile = data[j]
                        this.layers[name][x][y] = tile
                        j++
                    }
                }
            }
            else if (objects) {
                this.objects = this.objects.concat(objects)
            }
        })
    }

    getElementsByType (elementType) {
        return this.objects.find(({type}) => type === elementType)
    }

    setObjects (objects) {
        this.objects = objects
    }

    getObjects () {
        return this.objects
    }

    inRange (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height
    }

    get (layer, x, y) {
        return this.inRange(x, y) && this.layers[layer][x][y]
    }

    put (layer, x, y, value) {
        if (!this.inRange(x, y)) return false
        this.modifiers.push({layer, x, y, value})
        this.layers[layer][x][y] = value
    }

    tileData (x, y, layer = this.mainLayer) {
        const type = this.get(layer, x, y)
        return {
            type,
            x: this.spriteSize * x,
            y: this.spriteSize * y,
            width: this.spriteSize,
            height: this.spriteSize,
            solid: this.isSolid(x, y, layer),
            jumpThrough: this.jumpThroughTiles.indexOf(type) !== -1
        }
    }

    clearTile (x, y, layer) {
        if (this.inRange(x, y)) {
            this.layers[layer][x][y] = null
            this.modifiers.push({layer, x, y, value: null})
        }
    }

    isSolid (x, y, layer = this.mainLayer) {
        return !this.inRange(x, y) || this.layers[layer][x][y] > this.nonColideIndex
    }
}
