const noop = () => {}

const random = (min, max) => min + (Math.random() * (max - min))

const randomInt = (min, max) => Math.round(random(min, max))

const overlap = (a, b) => a.x < b.x + b.width &&  a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y

const getValues = ($) => $ && Object.entries($).map(([k, v]) => ({[k]: parseValue(v)}))

const normalize = (n, min, max) => {
    while (n < min) {
        n += (max - min)
    }
    while (n >= max) {
        n -= (max - min)
    }
    return n
}

const getProperties = (data) => {
    if (data && data.length) {
        const properties = {}
        data.map(({name, value}) => {
            properties[name] = value
        })
        return properties
    }
}

const parseValue = (value) => {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value.match(/^[+-]?\d+(\.\d+)?$/g)) {
        const parsedValue = parseFloat(value) 
        return !isNaN(parsedValue) ? parsedValue : value
    }
    return value
}

const isDataURL = (s) => !!s.match(
    /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+,;=\-._~:@/?%\s]*\s*$/i
)

export {
    noop,
    random,
    randomInt,
    overlap,
    normalize,
    getValues,
    getProperties,
    parseValue,
    isDataURL
}
