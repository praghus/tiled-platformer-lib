'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRGBA = exports.hexToRgbA = exports.path = exports.createCanvasAnd2dContext = exports.getPerformance = exports.getEmptyImage = exports.normalize = exports.getFilename = exports.isValidArray = exports.overlap = exports.randomInt = exports.random = exports.noop = undefined;
exports.createRectangleObject = createRectangleObject;
exports.createPolygonObject = createPolygonObject;
exports.createLamp = createLamp;
exports.setLightmaskElement = setLightmaskElement;

var _illuminated = require('./models/illuminated');

var noop = exports.noop = function noop() {};
var random = exports.random = function random(min, max) {
    return min + Math.random() * (max - min);
};
var randomInt = exports.randomInt = function randomInt(min, max) {
    return Math.round(random(min, max));
};
var overlap = exports.overlap = function overlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};
var isValidArray = exports.isValidArray = function isValidArray(arr) {
    return arr && arr.length;
};
var getFilename = exports.getFilename = function getFilename(path) {
    return path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');
};
var normalize = exports.normalize = function normalize(n, min, max) {
    while (n < min) {
        n += max - min;
    }
    while (n >= max) {
        n -= max - min;
    }
    return n;
};
var getEmptyImage = exports.getEmptyImage = function getEmptyImage() {
    var img = document.createElement('img');
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wYSESAUu+6QoAAAAF9JREFUOMutk0kOwDAIA+0q//+yeyLqkiCoywlFjFlDQYJhIxyC7IAzcTidSm7MFayIvOKfUCayjF0BrbddxkprgjR25RJkgNmGDrjmtvD/EK01Wof09ZRLq8pE6H7nE1n2iZCrGoItAAAAAElFTkSuQmCC';
    return img;
};

var getPerformance = exports.getPerformance = function getPerformance() {
    return typeof performance !== 'undefined' && performance.now();
};

/**
 * illuminated.js
 */

function createRectangleObject(x, y, width, height) {
    return new _illuminated.RectangleObject({
        topleft: new _illuminated.Vector(x, y),
        bottomright: new _illuminated.Vector(x + width, y + height)
    });
}

function createPolygonObject(x, y, points) {
    return new _illuminated.PolygonObject({ points: points.map(function (v) {
            return new _illuminated.Vector(v.x + x, v.y + y);
        }) });
}

function createLamp(x, y, distance, color) {
    var radius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 8;

    return new _illuminated.Lamp({
        color: color,
        distance: distance,
        radius: radius,
        samples: 1,
        position: new _illuminated.Vector(x, y)
    });
}

// @todo: make it better
function setLightmaskElement(element, _ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    if (element) {
        element.topleft = Object.assign(element.topleft, { x: x, y: y });
        element.bottomright = Object.assign(element.bottomright, { x: x + width, y: y + height });
        element.syncFromTopleftBottomright();
        return element;
    }
}

var createCanvasAnd2dContext = exports.createCanvasAnd2dContext = function createCanvasAnd2dContext(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return { canvas: canvas, ctx: canvas.getContext('2d'), w: w, h: h };
};

var path = exports.path = function path(ctx, points, dontJoinLast) {
    var p = points[0];
    ctx.moveTo(p.x, p.y);
    for (var i = 1; i < points.length; ++i) {
        p = points[i];
        ctx.lineTo(p.x, p.y);
    }
    if (!dontJoinLast && points.length > 2) {
        p = points[0];
        ctx.lineTo(p.x, p.y);
    }
};

var hexToRgbA = exports.hexToRgbA = function hexToRgbA(hex) {
    var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        var c = void 0;
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [c >> 16 & 255, c >> 8 & 255, c & 255].join(',') + (',' + alpha + ')');
    }
    throw new Error('Bad Hex');
};

var getRGBA = exports.getRGBA = function getRGBA(color, alpha) {
    return color.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/) ? hexToRgbA(color, alpha) : color.replace(/[d.]+\)$/g, alpha + ')');
};