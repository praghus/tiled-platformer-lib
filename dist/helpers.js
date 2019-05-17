'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var getValues = function getValues($) {
    return $ && Object.entries($).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];

        return _defineProperty({}, k, parseValue(v));
    });
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

var getProperties = function getProperties(data) {
    if (data && data.length) {
        var properties = {};
        data.map(function (_ref4) {
            var name = _ref4.name,
                value = _ref4.value;

            properties[name] = value;
        });
        return properties;
    }
};

var parseValue = function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value.match(/^[+-]?\d+(\.\d+)?$/g)) {
        var parsedValue = parseFloat(value);
        return !isNaN(parsedValue) ? parsedValue : value;
    }
    return value;
};

var isDataURL = function isDataURL(s) {
    return !!s.match(/^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+,;=\-._~:@/?%\s]*\s*$/i);
};

exports.noop = noop;
exports.random = random;
exports.randomInt = randomInt;
exports.overlap = overlap;
exports.normalize = normalize;
exports.getValues = getValues;
exports.getProperties = getProperties;
exports.parseValue = parseValue;
exports.isDataURL = isDataURL;