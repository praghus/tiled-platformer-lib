'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lightLayer = require('./light-layer');

var _helpers = require('../helpers');

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

var _sprite = require('./sprite');

var _sprite2 = _interopRequireDefault(_sprite);

var _tile = require('./tile');

var _tile2 = _interopRequireDefault(_tile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scene = function () {
    function Scene(game, _ref) {
        var viewport = _ref.viewport,
            assets = _ref.assets;

        _classCallCheck(this, Scene);

        this.assets = assets;
        this.dynamicLights = false;
        this.entities = [];
        this.game = game;
        this.gravity = 1;
        this.height = null;
        this.layers = [];
        this.lights = [];
        this.lightmask = [];
        this.map = null;
        this.objectsPool = {};
        this.resolutionX = null;
        this.resolutionY = null;
        this.scale = 1;
        this.shadowCastingLayer = null;
        this.sprites = {};
        this.tiles = {};
        this.width = null;

        this.resize(viewport);
    }

    _createClass(Scene, [{
        key: 'resize',
        value: function resize(viewport) {
            var width = viewport.width,
                height = viewport.height,
                resolutionX = viewport.resolutionX,
                resolutionY = viewport.resolutionY,
                scale = viewport.scale;


            this.width = width;
            this.height = height;
            this.resolutionX = resolutionX || width;
            this.resolutionY = resolutionY || height;
            this.scale = scale || 1;
        }
    }, {
        key: 'addTmxMap',
        value: function addTmxMap(data, entities) {
            var _this = this;

            var layers = data.layers;

            this.entities = entities;
            this.map = data;
            layers.map(function (layer) {
                return _this.addLayer(new _layer2.default(layer, _this.game));
            });
        }
    }, {
        key: 'update',
        value: function update() {
            this.clear();
            this.layers.map(function (layer) {
                return layer instanceof _layer2.default && layer.update();
            });
        }
    }, {
        key: 'draw',
        value: function draw() {
            var ctx = this.game.ctx,
                resolutionX = this.resolutionX,
                resolutionY = this.resolutionY,
                scale = this.scale;


            ctx.imageSmoothingEnabled = false;

            ctx.save();
            ctx.scale(scale, scale);
            ctx.clearRect(0, 0, resolutionX, resolutionY);

            this.layers.map(function (layer) {
                return layer instanceof _layer2.default && layer.draw();
            });

            ctx.restore();
        }
    }, {
        key: 'createSprite',
        value: function createSprite(id, props) {
            if (!this.sprites[id]) {
                this.sprites[id] = new _sprite2.default(props, this.game);
            }
            return this.sprites[id];
        }
    }, {
        key: 'createTile',
        value: function createTile(id) {
            if (!this.tiles[id]) {
                this.tiles[id] = new _tile2.default(id, this.game);
            }
            return this.tiles[id];
        }
    }, {
        key: 'addLight',
        value: function addLight(light) {
            this.lights.push(light);
        }
    }, {
        key: 'addLightMask',
        value: function addLightMask(lightMask) {
            this.lightmask.push(lightMask);
        }
    }, {
        key: 'toggleDynamicLights',
        value: function toggleDynamicLights(toggle) {
            this.dynamicLights = toggle;
        }
    }, {
        key: 'setShadowCastingLayer',
        value: function setShadowCastingLayer(layerId, index) {
            this.shadowCastingLayer = layerId;
            this.addLayer(new _lightLayer.LightLayer(this.game), index);
        }
    }, {
        key: 'setGravity',
        value: function setGravity(gravity) {
            this.gravity = gravity;
        }
    }, {
        key: 'addObject',
        value: function addObject(obj, layerId, index) {
            return this.getLayer(layerId).addObject(obj, index);
        }
    }, {
        key: 'addLayer',
        value: function addLayer(layer) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (layer instanceof _layer2.default) {
                index !== null ? this.layers.splice(index, 0, layer) : this.layers.push(layer);
            } else throw new Error('Invalid Layer!');
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
        key: 'getMapProperty',
        value: function getMapProperty(name) {
            return this.map.properties && this.map.properties[name];
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
            return this.getObjects(layerId).find(function (_ref2) {
                var properties = _ref2.properties;
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
            return this.map.tilesets.find(function (_ref3) {
                var firstgid = _ref3.firstgid,
                    tilecount = _ref3.tilecount;
                return tile + 1 >= firstgid && tile + 1 <= firstgid + tilecount;
            });
        }
    }, {
        key: 'getTile',
        value: function getTile(x, y, layerId) {
            return this.getLayer(layerId).getTile(x, y);
        }
    }, {
        key: 'getTileObject',
        value: function getTileObject(gid) {
            return this.tiles[gid] || null;
        }
    }, {
        key: 'putTile',
        value: function putTile(x, y, tileId, layerId) {
            return this.getLayer(layerId).putTile(x, y, tileId);
        }
    }, {
        key: 'clearTile',
        value: function clearTile(x, y, layerId) {
            return this.getLayer(layerId).clearTile(x, y);
        }
    }, {
        key: 'isSolidArea',
        value: function isSolidArea(x, y) {
            var _this2 = this;

            var layers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            return !!layers.map(function (layerId) {
                var tile = _this2.getTile(x, y, layerId);
                return tile && tile.isSolid();
            }).find(function (isTrue) {
                return !!isTrue;
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            delete this.lightmask;
            delete this.lights;
            this.lightmask = [];
            this.lights = [];
        }
    }]);

    return Scene;
}();

exports.default = Scene;
module.exports = exports.default;