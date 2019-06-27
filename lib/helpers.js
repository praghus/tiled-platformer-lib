import { Lamp, Vector, PolygonObject, RectangleObject } from './models/illuminated'

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
        topleft: new Vector(x, y),
        bottomright: new Vector(x + width, y + height)
    })
}

export function createPolygonObject (points) {
    console.info(points)
    return new PolygonObject(points)
}

export function createLamp (x, y, distance, color, radius = 8) {
    return new Lamp({
        color,
        distance,
        radius,
        samples: 1,
        position: new Vector(x, y)
    })
}

// @todo: make it better
export function setLightmaskElement (element, {x, y, width, height}) {
    if (element) {
        element.topleft = Object.assign(element.topleft, {x, y})
        element.bottomright = Object.assign(element.bottomright, {x: x + width, y: y + height})
        element.syncFromTopleftBottomright()
        return element
    }
}

export const createCanvasAnd2dContext = (w, h) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    return { canvas: canvas, ctx: canvas.getContext('2d'), w: w, h: h }
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

export const hexToRgbA = (hex, alpha = 1) => {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        let c
        c = hex.substring(1).split('')
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }
        c = '0x' + c.join('')
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `,${alpha})`
    }
    throw new Error('Bad Hex')
}

export const getRGBA = (color, alpha) => color.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/)
    ? hexToRgbA(color, alpha)
    : color.replace(/[d.]+\)$/g, `${alpha})`)

