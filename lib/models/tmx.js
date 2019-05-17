import 'babel-polyfill'
import zlib from 'zlib'
import { parseString } from 'xml2js'
import { 
    isDataURL, 
    getValues, 
    parseValue 
} from '../helpers'
import { 
    LAYER_TYPE, 
    SHAPE 
} from '../constants'

export const Tmx = async (xml) => {
    const tmx = await parseTmxFile(xml)
    const { map: { $, $$ } } = tmx
    const map = Object.assign({ 
        layers: {}, 
        tilesets: [] 
    }, ...getValues($))
    const expectedCount = map.width * map.height * 4
    await Promise.all($$.map(async (node, i) => {
        switch (node['#name']) {
        case 'layer':
            map.layers[i] = await parseTileLayer(node, expectedCount)
            break
        case 'objectgroup':
            map.layers[i] = parseObjectLayer(node)
            break
        case 'properties':
            map.properties = Object.assign(
                ...node.$$.map(
                    ({$: {name, value}}) => ({[name]: parseValue(value)})
                )
            )
            break
        case 'tileset':
            map.tilesets.push(getTileset(node))
            break
        }
    }))
    map.layers = Object.values(map.layers)
    return map
}

const parseTmxFile =  async (tmx) => {
    const xml = isDataURL(tmx) ? await parseDataUrl(tmx) : tmx
    return await new Promise ((resolve) => {
        parseString(xml, {
            explicitChildren: true,
            preserveChildrenOrder: true
        }, (err, tmx) => {
            if (err) {
                throw (new Error(err))
            }
            resolve(tmx)
        })
    })
}

const parseDataUrl = async (data) => {
    return await new Promise ((resolve) => {
        fetch(data)
            .then((response) => response.text())
            .then((body) => resolve(body))
    })
}

const getProperties = (properties) => {
    return ({ properties: properties && Object.assign(
        ...properties.map(({property}) => Object.assign(
            ...property.map(({ $: {name, value}, _ }) => (
                {[name]: value ? parseValue(value) : _ })
            )
        ))
    ) || null}) 
}

const parseTileLayer = async (layer, expectedCount) => {
    // gzip, zlib
    const { $, data, properties } = layer
    const newLayer = Object.assign({
        visible: 1,
        type: LAYER_TYPE.TILE_LAYER,
        ...getProperties(properties)
    }, ...getValues($))
    // const { encoding, compression } = $$[0].$
    const zipped = new Buffer(data[0]._.trim(), 'base64')
    newLayer.data = await new Promise((resolve, reject) => 
        zlib.inflate(zipped, (err, buf) => {
            if (err) reject(err)
            resolve(unpackTileBytes(buf, expectedCount))
        })
    )    
    return newLayer
}

const parseObjectLayer = (layer) => {
    const { $, object, properties } = layer
    return Object.assign({
        visible: 1, 
        type: LAYER_TYPE.OBJECT_LAYER,
        objects: object.map((object) => getObjectData(object)),
        ...getProperties(properties)
    }, ...getValues($))
}


const getObjectData = (data) => {
    const { 
        $, 
        properties, 
        polygon, 
        point, 
        ellipse 
    } = data
    
    const object = Object.assign({
        ...getProperties(properties)
    }, ...getValues($))
    
    if (point) {
        object.shape = SHAPE.POINT
    }
    else if (ellipse) {
        object.shape = SHAPE.ELLIPSE
    }
    else if (polygon) {
        object.shape = SHAPE.POLYGON
        object.points = polygon[0].$.points.split(' ').map((point) => {
            const [x, y] = point.split(',')
            return ([
                parseFloat(x), 
                parseFloat(y)
            ])
        })
    }
    else {
        object.shape = SHAPE.RECTANGLE
    }
    return object
}

const getTilesData = (data) => {
    const { $, animation } = data
    return Object.assign({
        frames: animation.length && animation[0].frame.map(
            ({$}) => Object.assign({}, ...getValues($))
        )
    }, ...getValues($))
}

const getTileset = (data) => {
    const { $, $$, tile } = data
    const image = $$ && Object.assign({}, ...getValues($$[0].$))
    const tiles = tile.length && tile.map((t) => getTilesData(t))
    return Object.assign(...getValues($), { image, tiles })
}

const unpackTileBytes = (buf, expectedCount) => {
    const unpackedTiles = []
    if (buf.length !== expectedCount) {
        throw (
            new Error(`Expected ${expectedCount} bytes of tile data; received ${buf.length}`)
        )
    }
    for (var i = 0; i < expectedCount; i += 4) {
        unpackedTiles.push(buf.readUInt32LE(i))
    }
    return unpackedTiles
}
