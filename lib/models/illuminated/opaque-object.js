import Vec2 from './vec2'

export default class OpaqueObject {
    constructor (options = {}) {
        this.diffuse = options.diffuse || 0.8
    }

    bounds  () { 
        return { 
            topleft: new Vec2(), 
            bottomright: new Vec2() 
        } 
    }

    contains () { 
        return false
    }
}
