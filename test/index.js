import { expect } from 'chai'
import { Entity, World } from '../lib'
import { mapData } from './data/map-data'
// import CanvasMock from './mocks/canvas-mock'
import ImageMock from './mocks/image-mock'

// const canvas = new CanvasMock(640, 480)
// const ctx = canvas.getContext('2d')

const worldConfig = {
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
        resolutionX: 640, 
        resolutionY: 480
    }
} 

const gameWorld = new World(mapData, worldConfig, {props: gameProps}) 
// const gamePlayer = gameWorld.getObjectByType('player', 2)


describe('World', () => {    
    it('World object should have its properties', () => {        
        expect(gameWorld.properties).to.include({
            'gravity': 0.5,
            'surfaceLevel': 64
        })
    })

    it('World object should contain all layers', () => {        
        expect(gameWorld.layers).to.have.length(2)
    })

    it('World object should contain all tilesets', () => {        
        expect(gameWorld.tilesets).to.have.length(1)
    })

    it('World object should contain all tiles', () => {        
        expect(gameWorld.tiles).to.have.keys([1, 2, 3, 4])
    })

    // it('World object should contain player object', () => {        
    //     expect(gamePlayer.dead).to.be.false
    //     expect(gamePlayer.x).to.equal(32)
    //     expect(gamePlayer.y).to.equal(112)
    // }) 
})
