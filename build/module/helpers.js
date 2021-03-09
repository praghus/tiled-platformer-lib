import { Circle, Point, Polygon } from 'lucendi';
import { COLORS } from './enums';
export const noop = () => { };
export const random = (min, max) => min + (Math.random() * (max - min));
export const randomInt = (min, max) => Math.round(random(min, max));
export const boxOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const isValidArray = (arr) => !!(arr && arr.length);
export const getFilename = (path) => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');
export const normalize = (n, min, max) => {
    while (n < min) {
        n += (max - min);
    }
    while (n >= max) {
        n -= (max - min);
    }
    return n;
};
export const getEmptyImage = () => {
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYSESAUu+6QoAAAAF9JREFUOMutk0kOwDAIA+0q//+yeyLqkiCoywlFjFlDQYJhIxyC7IAzcTidSm7MFayIvOKfUCayjF0BrbddxkprgjR25RJkgNmGDrjmtvD/EK01Wof09ZRLq8pE6H7nE1n2iZCrGoItAAAAAElFTkSuQmCC';
    return img;
};
export const getPerformance = () => typeof performance !== 'undefined' && performance.now();
export const getTileProperties = (gid, tileset) => {
    const { firstgid, tiles } = tileset;
    return isValidArray(tiles) && tiles.filter((tile) => tile.id === gid - firstgid)[0] || {};
};
export function getProperties(obj, property) {
    return obj.properties && obj.properties[property];
}
export function calculatePolygonBounds(points) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min.apply(null, xs);
    const minY = Math.min.apply(null, ys);
    const maxX = Math.max.apply(null, xs);
    const maxY = Math.max.apply(null, ys);
    const offsetX = minX < 0 && minX || 0;
    const offsetY = minY < 0 && minY || 0;
    return {
        x: offsetX,
        y: offsetY,
        w: maxX + Math.abs(offsetX),
        h: maxY + Math.abs(offsetY)
    };
}
export function outline(ctx) {
    return (x, y, width, height, color) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
    };
}
export function stroke(ctx) {
    return (x, y, points, color) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(points[0].x + x, points[0].y + y);
        points.map((v) => ctx.lineTo(x + v.x, y + v.y));
        ctx.lineTo(points[0].x + x, points[0].y + y);
        ctx.stroke();
        ctx.restore();
    };
}
export function fillText(ctx) {
    return (text, x, y, color = COLORS.LIGHT_RED) => {
        ctx.font = '4px Courier';
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    };
}
export function lightMaskRect(x, y, points) {
    return new Polygon(points.map((v) => new Point(v.x + x, v.y + y)));
}
export function lightMaskDisc(x, y, radius) {
    return new Circle(new Point(x + radius, y + radius), radius);
}
//# sourceMappingURL=helpers.js.map