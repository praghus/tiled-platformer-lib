import { 
    Lamp, 
    Vec2, 
    DiscObject, 
    PolygonObject, 
    RectangleObject 
} from './models/illuminated'

export const noop = () => {}
export const random = (min, max) => min + (Math.random() * (max - min))
export const randomInt = (min, max) => Math.round(random(min, max))
export const overlap = (a, b) => a.x < b.x + b.width &&  a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
export const isValidArray = (arr) => arr && arr.length
export const getFilename = (path) => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.')
export const normalize = (n, min, max) => {
    while (n < min) {
        n += (max - min)
    }
    while (n >= max) {
        n -= (max - min)
    }
    return n
}
export const getEmptyImage = () => {
    const img = document.createElement('img')
    img.src =  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYSESAUu+6QoAAAAF9JREFUOMutk0kOwDAIA+0q//+yeyLqkiCoywlFjFlDQYJhIxyC7IAzcTidSm7MFayIvOKfUCayjF0BrbddxkprgjR25RJkgNmGDrjmtvD/EK01Wof09ZRLq8pE6H7nE1n2iZCrGoItAAAAAElFTkSuQmCC'
    return img
}
export const getPerformance = () => typeof performance !== 'undefined' && performance.now()


/**
 * illuminated.js
 */

export function createRectangleObject (x, y, width, height) {
    return new RectangleObject({
        topleft: new Vec2(x, y),
        bottomright: new Vec2(x + width, y + height)
    })
}

export function createPolygonObject (x, y, points) {
    return new PolygonObject({points: points.map((v) => new Vec2(v.x + x, v.y + y))})
}

export function createDiscObject (x, y, radius) {
    return new DiscObject({center: new Vec2(x + radius, y + radius), radius})
}

export function createLamp (x, y, distance, color, radius = 8) {
    return new Lamp({
        color,
        distance,
        radius,
        samples: 1,
        position: new Vec2(x, y)
    })
}

export const path = (ctx, points, dontJoinLast) => {
    let p = points[0]
    ctx.moveTo(p.x, p.y)
    for (let i = 1; i < points.length; ++i) {
        p = points[i]
        ctx.lineTo(p.x, p.y)
    }
    if (!dontJoinLast && points.length > 2) {
        p = points[0]
        ctx.lineTo(p.x, p.y)
    }
}

export function createCanvasAnd2dContext (id, w, h) {
    const iid = 'illujs_' + id
    let canvas = document.getElementById(iid)

    if (canvas === null) {
        canvas = document.createElement('canvas')
        canvas.id = iid
        canvas.width = w
        canvas.height = h
        canvas.style.display = 'none'
        document.body.appendChild(canvas)
    }

    var ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    canvas.width = w
    canvas.height = h

    return { canvas: canvas, ctx: ctx, w: w, h: h }
}

export const getRGBA = (function () {
    var canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    var ctx = canvas.getContext('2d')

    return function (color, alpha) {
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 1, 1)
        var d = ctx.getImageData(0, 0, 1, 1).data
        return 'rgba(' + [ d[0], d[1], d[2], alpha ] + ')'
    }
}())

