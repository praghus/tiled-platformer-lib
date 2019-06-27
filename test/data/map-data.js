const nf = { H: false, V: false, D: false }
const fv = { H: false, V: true, D: false }
const fd = { H: false, V: false, D: true }

const player = {
    height: 16,
    id: 1,
    name: 'Player',
    properties: null,
    shape: 'rectangle',
    type: 'player',
    width: 16,
    x: 32,
    y: 112
}

const enemy = {
    height: 16,
    id: 2,
    name: 'zombie',
    properties: null,
    shape: 'rectangle',
    type: 'zombie',
    width: 16,
    x: 128,
    y: 112
}

export const mapData = {
    height: 8,
    infinite: 0,
    layers: [{
        data: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 2, 2, 2, 0, 0, 3, 3, 3, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        flips: [
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, fv, nf, fd, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf,
            nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf, nf
        ],
        height: 8,
        id: 1,
        name: 'ground',
        opacity: 0.77,
        properties: {
            collide: true
        },
        type: 'layer',
        visible: 1,
        width: 16
    }, {
        id: 2,
        name: 'objects',
        objects: [ player, enemy ], 
        properties: {
            collide: true
        },
        type: 'objectgroup',
        visible: 1
    }],
    nextlayerid: 9,
    nextobjectid: 165,
    orientation: 'orthogonal',
    properties: {
        gravity: 0.5, 
        surfaceLevel: 64
    },
    renderorder: 'right-down',
    tiledversion: '1.2.4',
    tileheight: 16,
    tilesets: [{
        columns: 32,
        firstgid: 1,
        image: {
            source: '../images/tiles.png', 
            width: 512, 
            height: 512
        },
        name: 'tiles',
        tilecount: 1024,
        tileheight: 16,
        tiles: [
            { id: 4, animation: {
                frames: [
                    {tileid: 5, duration: 500},
                    {tileid: 6, duration: 500},
                    {tileid: 7, duration: 500},
                    {tileid: 8, duration: 500}
                ]
            }},
            { id: 2, terrain: '0,0,0,0' }
        ],
        tilewidth: 16
    }],
    tilewidth: 16,
    version: 1.2,
    width: 16
}
