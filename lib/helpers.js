export const noop = () => {}
export const getValues = ($) => Object.entries($).map(([k, v]) => ({[k]: parseValue(v)}))
export function random (min, max) {
    return (min + (Math.random() * (max - min)))
}
export function randomInt (min, max) {
    return Math.round(random(min, max))
}
export function overlap (a, b) {
    return (
        a.x < b.x + b.width && 
        a.x + a.width > b.x && 
        a.y < b.y + b.height && 
        a.y + a.height > b.y
    )
}
export function normalize (n, min, max) {
    while (n < min) {
        n += (max - min)
    }
    while (n >= max) {
        n -= (max - min)
    }
    return n
}
export function getProperties (data) {
    if (data && data.length) {
        const properties = {}
        data.map(({name, value}) => {
            properties[name] = value
        })
        return properties
    }
}
export function parseValue (value) {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value.match(/^[+-]?\d+(\.\d+)?$/g)) {
        const parsedValue = parseFloat(value) 
        return !isNaN(parsedValue) ? parsedValue : value
    }
    return value
}
