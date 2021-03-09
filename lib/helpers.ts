import { Bounds, TmxTileset, StringTMap } from './types'
import { Circle, Point, Polygon, Vector } from 'lucendi'
import { COLORS } from './enums'

export const noop = (): void => {}

export const random = (min: number, max: number): number => min + (Math.random() * (max - min))

export const randomInt = (min: number, max: number): number => Math.round(random(min, max))

export const boxOverlap = (a: Bounds, b: Bounds) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export const isValidArray = (arr: any): boolean => !!(arr && arr.length)

export const getFilename = (path: string): string => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.')

export const normalize = (n: number, min: number, max: number): number => {
    while (n < min) {
        n += (max - min)
    }
    while (n >= max) {
        n -= (max - min)
    }
    return n
}

export const getEmptyImage = (): HTMLImageElement => {
    const img = document.createElement('img')
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYSESAUu+6QoAAAAF9JREFUOMutk0kOwDAIA+0q//+yeyLqkiCoywlFjFlDQYJhIxyC7IAzcTidSm7MFayIvOKfUCayjF0BrbddxkprgjR25RJkgNmGDrjmtvD/EK01Wof09ZRLq8pE6H7nE1n2iZCrGoItAAAAAElFTkSuQmCC'
    return img
}

export const getPerformance = (): number => typeof performance !== 'undefined' && performance.now()

export const getTileProperties = (gid: number, tileset: TmxTileset): StringTMap<any> => {
    const { firstgid, tiles } = tileset
    return isValidArray(tiles) && tiles.filter((tile) => tile.id === gid - firstgid)[0] || {}
}

export function getProperties (obj: any, property: string): any {
    return obj.properties && obj.properties[property]
}

export function calculatePolygonBounds (points: [number[]]): StringTMap<number> {
    const xs = points.map((p) => p[0])
    const ys = points.map((p) => p[1])

    const minX = Math.min.apply(null, xs)
    const minY = Math.min.apply(null, ys)
    const maxX = Math.max.apply(null, xs)
    const maxY = Math.max.apply(null, ys)

    const offsetX = minX < 0 && minX || 0
    const offsetY = minY < 0 && minY || 0

    return {
        x: offsetX,
        y: offsetY,
        w: maxX + Math.abs(offsetX),
        h: maxY + Math.abs(offsetY)
    }
}

export function outline (ctx: CanvasRenderingContext2D): (x, y, width, height, color) => void {
    return (x, y, width, height, color) => {
        ctx.save()
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + width, y)
        ctx.lineTo(x + width, y + height)
        ctx.lineTo(x, y + height)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.restore()
    }
}

export function stroke (ctx): (x, y, points, color) => void {
    return (x, y, points, color) => {
        ctx.save()
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(points[0].x + x, points[0].y + y)
        points.map((v: Vector) => ctx.lineTo(x + v.x, y + v.y))
        ctx.lineTo(points[0].x + x, points[0].y + y)
        ctx.stroke()
        ctx.restore()
    }
}

export function fillText (ctx: CanvasRenderingContext2D): (text: string, x: number, y: number, color?: string) => void {
    return (text: string, x: number, y: number, color = COLORS.LIGHT_RED) => {
        ctx.font = '4px Courier'
        ctx.fillStyle = color
        ctx.fillText(text, x, y)
    }
}

export function lightMaskRect (x: number, y: number, points: any[]) {
    return new Polygon(points.map((v) => new Point(v.x + x, v.y + y)))
}

export function lightMaskDisc (x: number, y: number, radius: number) {
    return new Circle(new Point(x + radius, y + radius), radius)
}
