'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tile = require('./tile');

var _tile2 = _interopRequireDefault(_tile);

var _constants = require('../constants');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Layer = function () {
    function Layer(layerData, game) {
        var _this = this;

        _classCallCheck(this, Layer);

        var id = layerData.id,
            name = layerData.name,
            data = layerData.data,
            objects = layerData.objects,
            width = layerData.width,
            height = layerData.height,
            type = layerData.type,
            visible = layerData.visible,
            properties = layerData.properties;


        this.id = id;
        this.game = game;
        this.name = name || '';
        this.type = type || _constants.NODE_TYPE.CUSTOM;
        this.visible = visible === undefined ? true : visible;
        this.properties = properties;
        this.width = width;
        this.height = height;

        this.data = [];
        this.objects = [];
        this.activeObjects = [];

        if (data) {
            this.data = [].concat(_toConsumableArray(Array(width).keys())).map(function () {
                return Array(height);
            });
            var j = 0;
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var tileId = data[j];
                    if (tileId > 0) {
                        this.data[x][y] = new _tile2.default(tileId, x, y, game);
                    }
                    j++;
                }
            }
        } else if (objects) {
            objects.map(function (obj) {
                return _this.addObject(obj);
            });
        }
    }

    _createClass(Layer, [{
        key: 'update',
        value: function update() {
            var _this2 = this;

            if ((0, _helpers.isValidArray)(this.objects)) {
                var scene = this.game.scene;


                this.clear();
                this.objects.map(function (obj) {
                    if (obj.onScreen()) {
                        _this2.activeObjects.map(function (activeObj) {
                            return activeObj.overlapTest(obj);
                        });

                        if (obj.light && obj.visible) scene.addLight(obj.getLight());
                        if (obj.shadowCaster && obj.visible) scene.addLightMask.apply(scene, _toConsumableArray(obj.getLightMask()));

                        obj.update && obj.update();
                        obj.dead ? _this2.removeObject(obj) : _this2.activeObjects.push(obj);
                    }
                });
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (this.visible) {
                switch (this.type) {
                    case _constants.NODE_TYPE.LAYER:
                        this.renderTileLayer();
                        break;
                    case _constants.NODE_TYPE.OBJECT_GROUP:
                        this.objects.map(function (obj) {
                            return obj.draw();
                        });
                        break;
                }
                // @todo: handle image layer
            }
        }
    }, {
        key: 'renderTileLayer',
        value: function renderTileLayer() {
            var _this3 = this;

            var _game = this.game,
                camera = _game.camera,
                scene = _game.scene;
            var resolutionX = scene.resolutionX,
                resolutionY = scene.resolutionY,
                _scene$map = scene.map,
                tilewidth = _scene$map.tilewidth,
                tileheight = _scene$map.tileheight;


            var y = Math.floor(camera.y % tileheight);
            var _y = Math.floor(-camera.y / tileheight);

            var _loop = function _loop() {
                var x = Math.floor(camera.x % tilewidth);
                var _x = Math.floor(-camera.x / tilewidth);
                while (x < resolutionX) {
                    var tile = _this3.getTile(_x, _y, _this3.id);
                    if (tile) {
                        // create shadow casters if necessary
                        if (_this3.id === scene.shadowCastingLayer && tile.isShadowCaster()) {
                            tile.collisionMask.map(function (_ref) {
                                var points = _ref.points;
                                return scene.addLightMask((0, _helpers.createPolygonObject)(x, y, points));
                            });
                        }
                        tile.draw();
                    }
                    x += tilewidth;
                    _x++;
                }
                y += tileheight;
                _y++;
            };

            while (y < resolutionY) {
                _loop();
            }
        }
    }, {
        key: 'getTile',
        value: function getTile(x, y) {
            return this.isInRange(x, y) && this.data[x][y];
        }
    }, {
        key: 'putTile',
        value: function putTile(x, y, tileId) {
            if (this.isInRange(x, y)) {
                this.data[x][y] = new _tile2.default(tileId, x, y, this.game);
            }
        }
    }, {
        key: 'clearTile',
        value: function clearTile(x, y) {
            if (this.isInRange(x, y)) {
                this.data[x][y] = null;
            }
        }
    }, {
        key: 'addObject',
        value: function addObject(obj) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var entities = this.game.scene.entities;

            try {
                var entity = (0, _helpers.isValidArray)(entities) && entities.find(function (_ref2) {
                    var type = _ref2.type;
                    return type === obj.type;
                });
                if (entity) {
                    var Entity = entity.model;
                    var newModel = new Entity(_extends({ layerId: this.id }, obj, entity), this.game);
                    index !== null ? this.objects.splice(index, 0, newModel) : this.objects.push(newModel);
                }
            } catch (e) {
                throw e;
            }
        }
    }, {
        key: 'removeObject',
        value: function removeObject(obj) {
            this.objects.splice(this.objects.indexOf(obj), 1);
        }
    }, {
        key: 'clear',
        value: function clear() {
            delete this.activeObjects;
            this.activeObjects = [];
        }
    }, {
        key: 'isInRange',
        value: function isInRange(x, y) {
            return x >= 0 && y >= 0 && x < this.width && y < this.height;
        }
    }]);

    return Layer;
}();

exports.default = Layer;
module.exports = exports.default;