import Vector from './vector'

export default class OpaqueObject {
    constructor (options = {}) {
        this.diffuse = options.diffuse || 0.8
    }

    bounds  () { 
        return { 
            topleft: new Vector(), 
            bottomright: new Vector() 
        } 
    }

    contains () { 
        return false
    }
}
