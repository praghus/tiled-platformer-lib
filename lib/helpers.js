export const noop = () => {}

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

export function random (min, max) {
    return (min + (Math.random() * (max - min)))
}

export function randomInt (min, max) {
    return Math.round(random(min, max))
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
