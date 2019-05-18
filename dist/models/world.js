'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

var _tile = require('./tile');

var _tile2 = _interopRequireDefault(_tile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var World = function () {
    function World(data, config, game) {
        var _this = this;

        _classCallCheck(this, World);

        var layers = data.layers,
            height = data.height,
            properties = data.properties,
            width = data.width,
            tilesets = data.tilesets,
            tilewidth = data.tilewidth;
        var entities = config.entities,
            gravity = config.gravity,
            nonColideTiles = config.nonColideTiles,
            oneWayTiles = config.oneWayTiles;


        this.game = game;
        this.layers = [];
        this.objectsPool = {};
        this.tiles = {};

        // config
        this.entities = entities || [];
        this.gravity = gravity || 1;
        this.oneWayTiles = oneWayTiles || [];
        this.nonColideTiles = nonColideTiles || [];

        // properties
        this.width = width;
        this.height = height;
        this.surface = properties.surfaceLevel || this.height;
        this.spriteSize = tilewidth;
        this.tilesets = tilesets;

        layers.map(function (_ref) {
            var id = _ref.id,
                name = _ref.name,
                data = _ref.data,
                objects = _ref.objects,
                type = _ref.type,
                visible = _ref.visible,
                properties = _ref.properties;

            var layer = { id: id, name: name, type: type, visible: visible, properties: properties };
            if (data) {
                layer.data = [].concat(_toConsumableArray(Array(width).keys())).map(function () {
                    return Array(height);
                });
                var j = 0;
                for (var y = 0; y < _this.height; y++) {
                    for (var x = 0; x < _this.width; x++) {
                        var tileId = data[j];
                        _this.createTile(tileId);
                        layer.data[x][y] = tileId;
                        j++;
                    }
                }
            } else if (objects) {
                layer.objects = [];
                objects.map(function (obj) {
                    var entity = _this.createObject(obj, layer.id);
                    entity && layer.objects.push(entity);
                });
            }
            _this.layers.push(layer);
        });
        // console.info(this.tiles)
    }

    _createClass(World, [{
        key: 'update',
        value: function update() {
            var _this2 = this;

            this.getObjectLayers().map(function (layer) {
                layer.objects.map(function (obj, index) {
                    if (!obj.dead) {
                        if (_this2.isCollisionLayer(layer)) {
                            // @todo: move collision detection into entity
                            for (var k = index + 1; k < layer.objects.length; k++) {
                                obj.overlapTest(layer.objects[k]);
                            }
                        }
                        obj.update && obj.update();
                    } else _this2.removeObject(obj);
                });
            });
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this3 = this;

            this.layers.map(function (layer) {
                if (layer.visible) {
                    switch (layer.type) {
                        case _constants.LAYER_TYPE.TILE_LAYER:
                            _this3.renderTileLayer(layer.id);
                            break;
                        case _constants.LAYER_TYPE.OBJECT_LAYER:
                            layer.objects.map(function (obj) {
                                return obj.draw();
                            });
                            break;
                    }
                } else if (typeof layer === 'function') {
                    layer();
                }
            });
        }
    }, {
        key: 'renderTileLayer',
        value: function renderTileLayer(layerId) {
            var spriteSize = this.spriteSize;
            var _game = this.game,
                ctx = _game.ctx,
                camera = _game.camera,
                _game$props$viewport = _game.props.viewport,
                resolutionX = _game$props$viewport.resolutionX,
                resolutionY = _game$props$viewport.resolutionY;


            var y = Math.floor(camera.y % spriteSize);
            var _y = Math.floor(-camera.y / spriteSize);

            while (y < resolutionY) {
                var x = Math.floor(camera.x % spriteSize);
                var _x = Math.floor(-camera.x / spriteSize);
                while (x < resolutionX) {
                    var tile = this.getTile(_x, _y, layerId);
                    if (tile > 0) {
                        this.tiles[tile].draw(x, y, ctx);
                    }
                    x += spriteSize;
                    _x++;
                }
                y += spriteSize;
                _y++;
            }
        }
    }, {
        key: 'addLayer',
        value: function addLayer(layer, index) {
            this.layers.splice(index, 0, layer);
        }
    }, {
        key: 'removeLayer',
        value: function removeLayer(index) {
            this.layers.splice(index, 1);
        }
    }, {
        key: 'showLayer',
        value: function showLayer(layerId) {
            this.getLayer(layerId).visible = true;
        }
    }, {
        key: 'hideLayer',
        value: function hideLayer(layerId) {
            this.getLayer(layerId).visible = false;
        }
    }, {
        key: 'getTileset',
        value: function getTileset(tile) {
            return this.tilesets.find(function (_ref2) {
                var firstgid = _ref2.firstgid,
                    tilecount = _ref2.tilecount;
                return tile >= firstgid && tile <= firstgid + tilecount;
            });
        }
    }, {
        key: 'createObject',
        value: function createObject(obj, layerId) {
            try {
                var entity = this.entities.filter(function (_ref3) {
                    var type = _ref3.type;
                    return type === obj.type;
                })[0] || null;
                if (entity) {
                    // first check if there are some objects of the same type in objectsPool
                    if (this.objectsPool[obj.type] && this.objectsPool[obj.type].length) {
                        var storedObj = this.objectsPool[obj.type].pop();
                        storedObj.restore();
                        Object.keys(obj).map(function (prop) {
                            storedObj[prop] = obj[prop];
                        });
                        return storedObj;
                    } else {
                        var Model = entity.model;
                        return new Model(_extends({
                            layerId: layerId
                        }, obj, entity), this.game);
                    }
                }
                return null;
            } catch (e) {
                throw e;
            }
        }
    }, {
        key: 'createTile',
        value: function createTile(tileId) {
            var assets = this.game.props.assets;

            var tileset = this.getTileset(tileId);
            if (!this.tiles[tileId] && tileId) {
                this.tiles[tileId] = new _tile2.default(tileId, {
                    asset: assets[tileset.name],
                    tileset: tileset
                });
            }
        }
    }, {
        key: 'addObject',
        value: function addObject(obj, layerId) {
            var entity = this.createObject(obj, layerId);
            entity && this.getObjects(layerId).push(entity);
        }
    }, {
        key: 'removeObject',
        value: function removeObject(obj) {
            var layerId = obj.layerId,
                type = obj.type;

            var objectLayer = this.getObjects(layerId);
            // move deleted object to objectsPool 
            // to reduce garbage collection and stuttering
            if (!this.objectsPool[type]) {
                this.objectsPool[type] = [];
            }
            this.objectsPool[type].push(obj);
            objectLayer.splice(objectLayer.indexOf(obj), 1);
        }
    }, {
        key: 'getObjects',
        value: function getObjects(layerId) {
            return this.getLayer(layerId).objects;
        }
    }, {
        key: 'getObjectById',
        value: function getObjectById(id, layerId) {
            return this.getObjects(layerId).find(function (object) {
                return object.id === id;
            });
        }
    }, {
        key: 'getObjectByType',
        value: function getObjectByType(type, layerId) {
            return this.getObjects(layerId).find(function (object) {
                return object.type === type;
            });
        }
    }, {
        key: 'getObjectByProperty',
        value: function getObjectByProperty(key, value, layerId) {
            return this.getObjects(layerId).find(function (_ref4) {
                var properties = _ref4.properties;
                return properties && properties[key] === value;
            });
        }

        // getAllObjects () {
        //     return [].concat.apply([], this.getObjectLayers()).map(({objects}) => objects)
        // }

    }, {
        key: 'getObjectLayers',
        value: function getObjectLayers() {
            return this.layers.filter(function (layer) {
                return layer.objects && layer.objects.length > 0;
            });
        }
    }, {
        key: 'inRange',
        value: function inRange(x, y) {
            return x >= 0 && y >= 0 && x < this.width && y < this.height;
        }
    }, {
        key: 'getLayer',
        value: function getLayer(id) {
            return this.layers.find(function (layer) {
                return layer.id === id;
            });
        }
    }, {
        key: 'getTile',
        value: function getTile(x, y, layerId) {
            return this.inRange(x, y) && this.getLayer(layerId).data[x][y];
        }
    }, {
        key: 'putTile',
        value: function putTile(x, y, value, layerId) {
            if (!this.inRange(x, y)) return false;
            this.getLayer(layerId).data[x][y] = value;
        }
    }, {
        key: 'isSolidTile',
        value: function isSolidTile(tile) {
            return tile > 0 && this.nonColideTiles.indexOf(tile) === -1;
        }
    }, {
        key: 'isOneWayTile',
        value: function isOneWayTile(tile) {
            return tile > 0 && this.oneWayTiles.indexOf(tile) !== -1;
        }
    }, {
        key: 'isSolidArea',
        value: function isSolidArea(x, y) {
            var _this4 = this;

            if (this.inRange(x, y)) {
                return !this.inRange(x, y) || !!this.getTilledCollisionLayers().map(function (layer) {
                    return _this4.isSolidTile(layer.data[x][y]);
                }).find(function (isTrue) {
                    return !!isTrue;
                });
            }
        }
    }, {
        key: 'isOneWayArea',
        value: function isOneWayArea(x, y) {
            var _this5 = this;

            if (this.inRange(x, y)) {
                return !!this.getTilledCollisionLayers().map(function (layer) {
                    return _this5.isOneWayTile(layer.data[x][y]);
                }).find(function (isTrue) {
                    return !!isTrue;
                });
            }
        }
    }, {
        key: 'isCollisionLayer',
        value: function isCollisionLayer(layer) {
            var properties = layer.properties;

            return properties ? !!properties.collide : false;
        }
    }, {
        key: 'getTilledCollisionLayers',
        value: function getTilledCollisionLayers() {
            var _this6 = this;

            return this.layers.filter(function (layer) {
                return layer.type === 'tilelayer' && _this6.isCollisionLayer(layer);
            }) || [];
        }
    }, {
        key: 'clearTile',
        value: function clearTile(x, y, layerId) {
            if (this.inRange(x, y)) {
                this.getLayer(layerId).data[x][y] = null;
            }
        }
    }]);

    return World;
}();

exports.default = World;
module.exports = exports.default;