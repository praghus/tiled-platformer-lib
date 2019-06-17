'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var noop = function noop() {};
var random = function random(min, max) {
    return min + Math.random() * (max - min);
};
var randomInt = function randomInt(min, max) {
    return Math.round(random(min, max));
};
var overlap = function overlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
};
var isValidArray = function isValidArray(arr) {
    return arr && arr.length;
};
var getFilename = function getFilename(path) {
    return path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');
};
var normalize = function normalize(n, min, max) {
    while (n < min) {
        n += max - min;
    }
    while (n >= max) {
        n -= max - min;
    }
    return n;
};

exports.noop = noop;
exports.random = random;
exports.randomInt = randomInt;
exports.overlap = overlap;
exports.normalize = normalize;
exports.getFilename = getFilename;
exports.isValidArray = isValidArray;