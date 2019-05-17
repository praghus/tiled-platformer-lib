'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tmx = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('babel-polyfill');

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _xml2js = require('xml2js');

var _helpers = require('../helpers');

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Tmx = exports.Tmx = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(xml) {
        var tmx, _tmx$map, $, $$, map, expectedCount;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return parseTmxFile(xml);

                    case 2:
                        tmx = _context2.sent;
                        _tmx$map = tmx.map, $ = _tmx$map.$, $$ = _tmx$map.$$;
                        map = Object.assign.apply(Object, [{
                            layers: {},
                            tilesets: []
                        }].concat(_toConsumableArray((0, _helpers.getValues)($))));
                        expectedCount = map.width * map.height * 4;
                        _context2.next = 8;
                        return Promise.all($$.map(function () {
                            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(node, i) {
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                _context.t0 = node['#name'];
                                                _context.next = _context.t0 === 'layer' ? 3 : _context.t0 === 'objectgroup' ? 7 : _context.t0 === 'properties' ? 9 : _context.t0 === 'tileset' ? 11 : 13;
                                                break;

                                            case 3:
                                                _context.next = 5;
                                                return parseTileLayer(node, expectedCount);

                                            case 5:
                                                map.layers[i] = _context.sent;
                                                return _context.abrupt('break', 13);

                                            case 7:
                                                map.layers[i] = parseObjectLayer(node);
                                                return _context.abrupt('break', 13);

                                            case 9:
                                                map.properties = Object.assign.apply(Object, _toConsumableArray(node.$$.map(function (_ref3) {
                                                    var _ref3$$ = _ref3.$,
                                                        name = _ref3$$.name,
                                                        value = _ref3$$.value;
                                                    return _defineProperty({}, name, (0, _helpers.parseValue)(value));
                                                })));
                                                return _context.abrupt('break', 13);

                                            case 11:
                                                map.tilesets.push(getTileset(node));
                                                return _context.abrupt('break', 13);

                                            case 13:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, undefined);
                            }));

                            return function (_x2, _x3) {
                                return _ref2.apply(this, arguments);
                            };
                        }()));

                    case 8:
                        map.layers = Object.values(map.layers);
                        return _context2.abrupt('return', map);

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function Tmx(_x) {
        return _ref.apply(this, arguments);
    };
}();

var parseTmxFile = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(tmx) {
        var xml;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (!(0, _helpers.isDataURL)(tmx)) {
                            _context3.next = 6;
                            break;
                        }

                        _context3.next = 3;
                        return parseDataUrl(tmx);

                    case 3:
                        _context3.t0 = _context3.sent;
                        _context3.next = 7;
                        break;

                    case 6:
                        _context3.t0 = tmx;

                    case 7:
                        xml = _context3.t0;
                        _context3.next = 10;
                        return new Promise(function (resolve) {
                            (0, _xml2js.parseString)(xml, {
                                explicitChildren: true,
                                preserveChildrenOrder: true
                            }, function (err, tmx) {
                                if (err) {
                                    throw new Error(err);
                                }
                                resolve(tmx);
                            });
                        });

                    case 10:
                        return _context3.abrupt('return', _context3.sent);

                    case 11:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function parseTmxFile(_x4) {
        return _ref5.apply(this, arguments);
    };
}();

var parseDataUrl = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(data) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return new Promise(function (resolve) {
                            fetch(data).then(function (response) {
                                return response.text();
                            }).then(function (body) {
                                return resolve(body);
                            });
                        });

                    case 2:
                        return _context4.abrupt('return', _context4.sent);

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function parseDataUrl(_x5) {
        return _ref6.apply(this, arguments);
    };
}();

var getProperties = function getProperties(properties) {
    return { properties: properties && Object.assign.apply(Object, _toConsumableArray(properties.map(function (_ref7) {
            var property = _ref7.property;
            return Object.assign.apply(Object, _toConsumableArray(property.map(function (_ref8) {
                var _ref8$$ = _ref8.$,
                    name = _ref8$$.name,
                    value = _ref8$$.value,
                    _ = _ref8._;
                return _defineProperty({}, name, value ? (0, _helpers.parseValue)(value) : _);
            })));
        }))) || null };
};

var parseTileLayer = function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(layer, expectedCount) {
        var $, data, properties, newLayer, zipped;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        // gzip, zlib
                        $ = layer.$, data = layer.data, properties = layer.properties;
                        newLayer = Object.assign.apply(Object, [_extends({
                            visible: 1,
                            type: _constants.LAYER_TYPE.TILE_LAYER
                        }, getProperties(properties))].concat(_toConsumableArray((0, _helpers.getValues)($))));
                        // const { encoding, compression } = $$[0].$

                        zipped = new Buffer(data[0]._.trim(), 'base64');
                        _context5.next = 5;
                        return new Promise(function (resolve, reject) {
                            return _zlib2.default.inflate(zipped, function (err, buf) {
                                if (err) reject(err);
                                resolve(unpackTileBytes(buf, expectedCount));
                            });
                        });

                    case 5:
                        newLayer.data = _context5.sent;
                        return _context5.abrupt('return', newLayer);

                    case 7:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function parseTileLayer(_x6, _x7) {
        return _ref10.apply(this, arguments);
    };
}();

var parseObjectLayer = function parseObjectLayer(layer) {
    var $ = layer.$,
        object = layer.object,
        properties = layer.properties;

    return Object.assign.apply(Object, [_extends({
        visible: 1,
        type: _constants.LAYER_TYPE.OBJECT_LAYER,
        objects: object.map(function (object) {
            return getObjectData(object);
        })
    }, getProperties(properties))].concat(_toConsumableArray((0, _helpers.getValues)($))));
};

var getObjectData = function getObjectData(data) {
    var $ = data.$,
        properties = data.properties,
        polygon = data.polygon,
        point = data.point,
        ellipse = data.ellipse;


    var object = Object.assign.apply(Object, [_extends({}, getProperties(properties))].concat(_toConsumableArray((0, _helpers.getValues)($))));

    if (point) {
        object.shape = _constants.SHAPE.POINT;
    } else if (ellipse) {
        object.shape = _constants.SHAPE.ELLIPSE;
    } else if (polygon) {
        object.shape = _constants.SHAPE.POLYGON;
        object.points = polygon[0].$.points.split(' ').map(function (point) {
            var _point$split = point.split(','),
                _point$split2 = _slicedToArray(_point$split, 2),
                x = _point$split2[0],
                y = _point$split2[1];

            return [parseFloat(x), parseFloat(y)];
        });
    } else {
        object.shape = _constants.SHAPE.RECTANGLE;
    }
    return object;
};

var getTilesData = function getTilesData(data) {
    var $ = data.$,
        animation = data.animation;

    return Object.assign.apply(Object, [{
        frames: animation.length && animation[0].frame.map(function (_ref11) {
            var $ = _ref11.$;
            return Object.assign.apply(Object, [{}].concat(_toConsumableArray((0, _helpers.getValues)($))));
        })
    }].concat(_toConsumableArray((0, _helpers.getValues)($))));
};

var getTileset = function getTileset(data) {
    var $ = data.$,
        $$ = data.$$,
        tile = data.tile;

    var image = $$ && Object.assign.apply(Object, [{}].concat(_toConsumableArray((0, _helpers.getValues)($$[0].$))));
    var tiles = tile.length && tile.map(function (t) {
        return getTilesData(t);
    });
    return Object.assign.apply(Object, _toConsumableArray((0, _helpers.getValues)($)).concat([{ image: image, tiles: tiles }]));
};

var unpackTileBytes = function unpackTileBytes(buf, expectedCount) {
    var unpackedTiles = [];
    if (buf.length !== expectedCount) {
        throw new Error('Expected ' + expectedCount + ' bytes of tile data; received ' + buf.length);
    }
    for (var i = 0; i < expectedCount; i += 4) {
        unpackedTiles.push(buf.readUInt32LE(i));
    }
    return unpackedTiles;
};