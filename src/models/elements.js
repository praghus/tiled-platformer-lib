export default class Elements {
    constructor (entities, scene) {
        this._scene = scene
        this.objects = []
        this.objectsPool = {}
        entities.map((entity) => this.add(entity))
    }

    update () {
        const { player } = this._scene
        this.objects.map((obj, index) => {
            if (obj) {
                if (obj.dead) {
                    // create objectsPool to reduce garbage collection and stuttering
                    if (!this.objectsPool[obj.type]) {
                        this.objectsPool[obj.type] = []
                    }
                    this.objectsPool[obj.type].push(obj)
                    this.objects.splice(index, 1)
                }
                else {
                    obj.overlapTest(player)
                    for (let k = index + 1; k < this.objects.length; k++) {
                        this.objects[index].overlapTest(this.objects[k])
                    }
                    obj.update && obj.update()
                }
            }
        })
    }

    create (obj) {
        try {
            const { world: { entities } } = this._scene
            const entity = entities.filter(({type}) => type === obj.type)[0] || null
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

    add (obj) {
        const entity = this.create(obj)
        if (entity) {
            this.objects.push(entity)
        }
    }

    getById (id) {
        return this.objects.find((obj) => obj.id === id)
    }

    getByProperties (key, value) {
        return this.objects.filter(
            (object) => object.properties && object.properties.filter(
                (property) => property.name === key && property.value === value
            )[0]
        )[0]
    }
}
