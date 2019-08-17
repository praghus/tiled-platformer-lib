import { expect } from 'chai'
import { Entity, Layer } from '../lib'
import { mapData } from './data/map-data'
// import CanvasMock from './mocks/canvas-mock'
import ImageMock from './mocks/image-mock'

// const canvas = new CanvasMock(640, 480)
// const ctx = canvas.getContext('2d')

const config = {
    gravity: 0.5,
    entities: [
        { type: 'player', model: Entity, asset: 'player.png' },
        { type: 'enemy', family: 'enemies', model: Entity, asset: 'zombie.png' }
    ],
    nonColideTiles: [4],
    oneWayTiles: [2, 3]
}

const gameProps = {
    assets: {
        'player.png': ImageMock, 
        'zombie.png': ImageMock
    },
    viewport: {
        width: 640,
        height: 480,
        resolutionX: 640, 
        resolutionY: 480
    }
} 

const gameLayer = new Layer(mapData, config, gameProps) 
// const gamePlayer = gameLayer.getObjectByType('player', 2)


describe('Layer', () => {    
    it('Layer object should have its properties', () => {        
        expect(gameLayer.properties).to.include({
            'gravity': 0.5,
            'surfaceLevel': 64
        })
    })

    // it('Layer object should contain all layers', () => {        
    //     expect(gameLayer.layers).to.have.length(2)
    // })

    // it('Layer object should contain all tilesets', () => {        
    //     expect(gameLayer.tilesets).to.have.length(1)
    // })

    // it('Layer object should contain all tiles', () => {        
    //     expect(gameLayer.tiles).to.have.keys([1, 2, 3, 4])
    // })

    // it('Scene object should contain player object', () => {        
    //     expect(gamePlayer.dead).to.be.false
    //     expect(gamePlayer.x).to.equal(32)
    //     expect(gamePlayer.y).to.equal(112)
    // }) 
})
