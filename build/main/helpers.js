"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightMaskDisc = exports.lightMaskRect = exports.fillText = exports.stroke = exports.outline = exports.calculatePolygonBounds = exports.getProperties = exports.getTileProperties = exports.getPerformance = exports.getEmptyImage = exports.normalize = exports.getFilename = exports.isValidArray = exports.boxOverlap = exports.randomInt = exports.random = exports.noop = void 0;
const lucendi_1 = require("lucendi");
const enums_1 = require("./enums");
const noop = () => { };
exports.noop = noop;
const random = (min, max) => min + (Math.random() * (max - min));
exports.random = random;
const randomInt = (min, max) => Math.round(exports.random(min, max));
exports.randomInt = randomInt;
const boxOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
exports.boxOverlap = boxOverlap;
const isValidArray = (arr) => !!(arr && arr.length);
exports.isValidArray = isValidArray;
const getFilename = (path) => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');
exports.getFilename = getFilename;
const normalize = (n, min, max) => {
    while (n < min) {
        n += (max - min);
    }
    while (n >= max) {
        n -= (max - min);
    }
    return n;
};
exports.normalize = normalize;
const getEmptyImage = () => {
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYSESAUu+6QoAAAAF9JREFUOMutk0kOwDAIA+0q//+yeyLqkiCoywlFjFlDQYJhIxyC7IAzcTidSm7MFayIvOKfUCayjF0BrbddxkprgjR25RJkgNmGDrjmtvD/EK01Wof09ZRLq8pE6H7nE1n2iZCrGoItAAAAAElFTkSuQmCC';
    return img;
};
exports.getEmptyImage = getEmptyImage;
const getPerformance = () => typeof performance !== 'undefined' && performance.now();
exports.getPerformance = getPerformance;
const getTileProperties = (gid, tileset) => {
    const { firstgid, tiles } = tileset;
    return exports.isValidArray(tiles) && tiles.filter((tile) => tile.id === gid - firstgid)[0] || {};
};
exports.getTileProperties = getTileProperties;
function getProperties(obj, property) {
    return obj.properties && obj.properties[property];
}
exports.getProperties = getProperties;
function calculatePolygonBounds(points) {
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
exports.calculatePolygonBounds = calculatePolygonBounds;
function outline(ctx) {
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
exports.outline = outline;
function stroke(ctx) {
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
exports.stroke = stroke;
function fillText(ctx) {
    return (text, x, y, color = enums_1.COLORS.LIGHT_RED) => {
        ctx.font = '4px Courier';
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    };
}
exports.fillText = fillText;
function lightMaskRect(x, y, points) {
    return new lucendi_1.Polygon(points.map((v) => new lucendi_1.Point(v.x + x, v.y + y)));
}
exports.lightMaskRect = lightMaskRect;
function lightMaskDisc(x, y, radius) {
    return new lucendi_1.Circle(new lucendi_1.Point(x + radius, y + radius), radius);
}
exports.lightMaskDisc = lightMaskDisc;
//# sourceMappingURL=helpers.js.map