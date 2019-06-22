const noop = () => {}
const random = (min, max) => min + (Math.random() * (max - min))
const randomInt = (min, max) => Math.round(random(min, max))
const overlap = (a, b) => a.x < b.x + b.width &&  a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
const isValidArray = (arr) => arr && arr.length
const getFilename = (path) => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.')
const normalize = (n, min, max) => {
    while (n < min) {
        n += (max - min)
    }
    while (n >= max) {
        n -= (max - min)
    }
    return n
}
const getEmptyImage = () => {
    const img = document.createElement('img')
    img.src =  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYSESAUu+6QoAAAAF9JREFUOMutk0kOwDAIA+0q//+yeyLqkiCoywlFjFlDQYJhIxyC7IAzcTidSm7MFayIvOKfUCayjF0BrbddxkprgjR25RJkgNmGDrjmtvD/EK01Wof09ZRLq8pE6H7nE1n2iZCrGoItAAAAAElFTkSuQmCC'
    return img
}

const getPerformance = () => typeof performance !== 'undefined' && performance.now()

export {
    noop,
    random,
    randomInt,
    overlap,
    normalize,
    getFilename,
    getEmptyImage,
    getPerformance,
    isValidArray
}
