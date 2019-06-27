'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

var _illuminated = require('./illuminated');

var _helpers = require('../helpers');

var _tile = require('./tile');

var _tile2 = _interopRequireDefault(_tile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var World = function () {
    function World(data, entities, game) {
        var _this = this;

        _classCallCheck(this, World);

        var layers = data.layers,
            height = data.height,
            properties = data.properties,
            width = data.width,
            tilesets = data.tilesets,
            tilewidth = data.tilewidth;


        this.entities = entities;
        this.game = game;
        this.layers = [];
        this.activeObjects = [];
        this.objectsPool = {};
        this.tiles = {};
        this.properties = properties;
        this.width = width;
        this.height = height;
        this.spriteSize = tilewidth;
        this.tilesets = tilesets;
        this.gravity = this.properties.gravity || 1;
        this.dynamicLights = false;

        // dynamic lights and shadows
        this.lighting = new _illuminated.Lighting();
        this.darkmask = new _illuminated.DarkMask();
        this.lightmask = [];
        this.lights = [];
        this.light = null;
        this.shadowCastingLayer = null;

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
                        if (tileId > 0) {
                            _this.createTile(tileId);
                            layer.data[x][y] = tileId;
                        }
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
    }

    _createClass(World, [{
        key: 'update',
        value: function update() {
            var _this2 = this;

            var camera = this.game.camera;

            this.activeObjects = [];
            this.darkmask.lights = [];
            this.dynamicLights && this.clearLights();
            this.getObjectLayers().map(function (layer) {
                layer.objects.map(function (obj) {
                    if (!obj.dead) {
                        if (obj.onScreen() || obj.activated) {
                            _this2.activeObjects.map(function (activeObj) {
                                return activeObj.overlapTest(obj);
                            });
                            if (obj.light) {
                                obj.light.position = new _illuminated.Vector(obj.x + obj.width / 2 + camera.x, obj.y + obj.height / 2 + camera.y);
                                _this2.darkmask.lights.push(obj.light);
                            }
                            obj.update && obj.update();
                            _this2.activeObjects.push(obj);
                        }
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
                        case _constants.NODE_TYPE.LAYER:
                            _this3.renderTileLayer(layer.id);
                            break;
                        case _constants.NODE_TYPE.OBJECT_GROUP:
                            layer.objects.map(function (obj) {
                                return obj.draw();
                            });
                            break;
                    }
                    // @todo: handle image layer
                } else if (typeof layer === 'function') {
                    layer();
                }
            });
        }
    }, {
        key: 'renderTileLayer',
        value: function renderTileLayer(layerId) {
            var _this4 = this;

            var _game = this.game,
                ctx = _game.ctx,
                camera = _game.camera,
                debug = _game.debug,
                _game$props$viewport = _game.props.viewport,
                resolutionX = _game$props$viewport.resolutionX,
                resolutionY = _game$props$viewport.resolutionY;


            var y = Math.floor(camera.y % this.spriteSize);
            var _y = Math.floor(-camera.y / this.spriteSize);

            var shouldRenderLights = this.dynamicLights && layerId === this.shadowCastingLayer;

            var _loop = function _loop() {
                var x = Math.floor(camera.x % _this4.spriteSize);
                var _x = Math.floor(-camera.x / _this4.spriteSize);
                while (x < resolutionX) {
                    var tile = _this4.getTile(_x, _y, layerId);
                    if (tile > 0) {
                        // create shadow casters if necessary
                        if (shouldRenderLights && _this4.isSolidTile(tile)) {
                            // experimental
                            _this4.tiles[tile].collisionLayer.map(function (_ref2) {
                                var points = _ref2.points;

                                _this4.lightmask.push((0, _helpers.createPolygonObject)(x, y, points));
                            });
                        }
                        _this4.tiles[tile].draw(ctx, x, y, { debug: debug });
                    }
                    x += _this4.spriteSize;
                    _x++;
                }
                y += _this4.spriteSize;
                _y++;
            };

            while (y < resolutionY) {
                _loop();
            }
            shouldRenderLights && this.renderLightingEffect();
        }
    }, {
        key: 'renderLightingEffect',
        value: function renderLightingEffect() {
            var _game2 = this.game,
                ctx = _game2.ctx,
                _game2$props$viewport = _game2.props.viewport,
                resolutionX = _game2$props$viewport.resolutionX,
                resolutionY = _game2$props$viewport.resolutionY;


            this.lighting.light = this.light;
            this.lighting.objects = this.lightmask;

            this.lighting.compute(resolutionX, resolutionY);
            this.darkmask.compute(resolutionX, resolutionY);

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            this.lighting.render(ctx);
            ctx.globalCompositeOperation = 'source-over';
            this.darkmask.render(ctx);
            ctx.restore();
        }
    }, {
        key: 'toggleDynamicLights',
        value: function toggleDynamicLights(toggle) {
            this.dynamicLights = toggle;
        }
    }, {
        key: 'setDynamicLights',
        value: function setDynamicLights(layerId, lightSource) {
            this.dynamicLights = true;
            this.light = lightSource;
            this.shadowCastingLayer = layerId;
        }
    }, {
        key: 'clearLights',
        value: function clearLights() {
            var _this5 = this;

            this.lightmask.map(function (v, k) {
                _this5.lightmask[k] = null;
            });
            this.lights.map(function (v, k) {
                _this5.lights[k] = null;
            });
            this.lightmask.splice(0, this.lightmask.length);
            this.lights.splice(0, this.lights.length);
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
        key: 'createObject',
        value: function createObject(obj, layerId) {
            try {
                var entity = (0, _helpers.isValidArray)(this.entities) && this.entities.find(function (_ref3) {
                    var type = _ref3.type;
                    return type === obj.type;
                });
                if (entity) {
                    // first check if there are some objects of the same type in objectsPool
                    // if (isValidArray(this.objectsPool[obj.type])) {
                    //     console.info('Restored', obj.type)
                    //     const storedObj = this.objectsPool[obj.type].pop()
                    //     storedObj.restore()
                    //     Object.keys(obj).map((prop) => {
                    //         storedObj[prop] = obj[prop]
                    //     })
                    //     return storedObj
                    // }
                    // else {
                    var Entity = entity.model;
                    return new Entity(_extends({ layerId: layerId }, obj, entity), this.game);
                    // }
                }
                return null;
            } catch (e) {
                throw e;
            }
        }
    }, {
        key: 'removeObject',
        value: function removeObject(obj) {
            //const { layerId, type } = obj
            var objectLayer = this.getObjects(obj.layerId);
            // move deleted object to objectsPool
            // to reduce garbage collection and stuttering
            // if (!this.objectsPool[type]) {
            //     this.objectsPool[type] = []
            // }
            // this.objectsPool[type].push(obj)
            objectLayer.splice(objectLayer.indexOf(obj), 1);
        }
    }, {
        key: 'createTile',
        value: function createTile(tileId) {
            var assets = this.game.props.assets;

            var tileset = this.getTileset(tileId);
            if (!this.tiles[tileId] && tileset) {
                var filename = (0, _helpers.getFilename)(tileset.image.source);
                this.tiles[tileId] = new _tile2.default(tileId, assets[filename], tileset);
            }
            return this.tiles[tileId] || null;
        }
    }, {
        key: 'addObject',
        value: function addObject(obj, layerId) {
            var entity = this.createObject(obj, layerId);
            entity && this.getObjects(layerId).push(entity);
        }
    }, {
        key: 'getProperty',
        value: function getProperty(name) {
            return this.properties && this.properties[name];
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
    }, {
        key: 'getObjectLayers',
        value: function getObjectLayers() {
            return this.layers.filter(function (layer) {
                return (0, _helpers.isValidArray)(layer.objects);
            });
        }
    }, {
        key: 'getLayer',
        value: function getLayer(id) {
            return this.layers.find(function (layer) {
                return layer.id === id;
            });
        }
    }, {
        key: 'getTileset',
        value: function getTileset(tile) {
            return this.tilesets.find(function (_ref5) {
                var firstgid = _ref5.firstgid,
                    tilecount = _ref5.tilecount;
                return tile + 1 >= firstgid && tile + 1 <= firstgid + tilecount;
            });
        }
    }, {
        key: 'getTile',
        value: function getTile(x, y, layerId) {
            return this.isInRange(x, y) && this.getLayer(layerId).data[x][y];
        }
    }, {
        key: 'putTile',
        value: function putTile(x, y, value, layerId) {
            if (!this.isInRange(x, y)) return false;
            this.getLayer(layerId).data[x][y] = value;
        }
    }, {
        key: 'clearTile',
        value: function clearTile(x, y, layerId) {
            if (this.isInRange(x, y)) {
                this.getLayer(layerId).data[x][y] = null;
            }
        }
    }, {
        key: 'isSolidTile',
        value: function isSolidTile(tile) {
            return tile > 0 && this.tiles[tile] && this.tiles[tile].type !== _constants.TILE_TYPE.NON_COLLIDING;
        }
    }, {
        key: 'isSolidArea',
        value: function isSolidArea(x, y) {
            var _this6 = this;

            var layers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            return !this.isInRange(x, y) || !!layers.map(function (layerId) {
                return _this6.isSolidTile(_this6.getLayer(layerId).data[x][y]);
            }).find(function (isTrue) {
                return !!isTrue;
            });
        }
    }, {
        key: 'isInRange',
        value: function isInRange(x, y) {
            return x >= 0 && y >= 0 && x < this.width && y < this.height;
        }
    }]);

    return World;
}();

exports.default = World;
module.exports = exports.default;