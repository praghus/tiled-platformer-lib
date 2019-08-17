'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRGBA = exports.path = exports.getTileProperties = exports.getPerformance = exports.getEmptyImage = exports.normalize = exports.getFilename = exports.isValidArray = exports.overlap = exports.randomInt = exports.random = exports.noop = undefined;
exports.getProperties = getProperties;
exports.createPolygonObject = createPolygonObject;
exports.createDiscObject = createDiscObject;
exports.createLamp = createLamp;
exports.createCanvasAnd2dContext = createCanvasAnd2dContext;

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

var getTileProperties = exports.getTileProperties = function getTileProperties(gid, tileset) {
    var firstgid = tileset.firstgid,
        tiles = tileset.tiles;

    return isValidArray(tiles) && tiles.filter(function (tile) {
        return tile.id === gid - firstgid;
    })[0] || {};
};

function getProperties(obj, property) {
    return obj.properties && obj.properties[property];
}

/**
 * illuminated.js
 */

function createPolygonObject(x, y, points) {
    return new _illuminated.PolygonObject({ points: points.map(function (v) {
            return new _illuminated.Vec2(v.x + x, v.y + y);
        }) });
}

function createDiscObject(x, y, radius) {
    return new _illuminated.DiscObject({ center: new _illuminated.Vec2(x + radius, y + radius), radius: radius });
}

function createLamp(x, y, distance, color) {
    var radius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 8;

    return new _illuminated.Lamp({
        color: color,
        distance: distance,
        radius: radius,
        samples: 1,
        position: new _illuminated.Vec2(x, y)
    });
}

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

function createCanvasAnd2dContext(id, w, h) {
    var iid = 'illujs_' + id;
    var canvas = document.getElementById(iid);

    if (canvas === null) {
        canvas = document.createElement('canvas');
        canvas.id = iid;
        canvas.width = w;
        canvas.height = h;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
    }

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = w;
    canvas.height = h;

    return { canvas: canvas, ctx: ctx, w: w, h: h };
}

var getRGBA = exports.getRGBA = function () {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    var ctx = canvas.getContext('2d');

    return function (color, alpha) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        var d = ctx.getImageData(0, 0, 1, 1).data;
        return 'rgba(' + [d[0], d[1], d[2], alpha] + ')';
    };
}();