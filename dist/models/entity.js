'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sprite = require('./sprite');

var _sprite2 = _interopRequireDefault(_sprite);

var _illuminated = require('./illuminated');

var _sat = require('sat');

var _helpers = require('../helpers');

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = function () {
    function Entity(obj, game) {
        var _this = this;

        _classCallCheck(this, Entity);

        this.activated = false;
        this.collisionMask = null;
        this.collisionLayers = null;
        this.dead = false;
        this.force = new _sat.Vector(0, 0);
        this.game = game;
        this.initialPosition = new _sat.Vector(obj.x, obj.y);
        this.maxSpeed = 1;
        this.onFloor = false;
        this.shadowCaster = false;
        this.solid = false;
        this.speed = 0;
        this.states = null;

        this.setBoundingBox(0, 0, obj.width, obj.height);

        Object.keys(obj).map(function (prop) {
            _this[prop] = obj[prop];
        });

        if (this.asset || this.gid) {
            this.sprite = new _sprite2.default({
                asset: this.asset,
                gid: this.gid,
                width: this.width,
                height: this.height
            }, game);
        }
    }

    _createClass(Entity, [{
        key: 'setState',
        value: function setState(state) {
            if ((0, _helpers.isValidArray)(this.states) && this.states.indexOf(state) !== -1) {
                this.state = state;
            }
        }
    }, {
        key: 'setBoundingBox',
        value: function setBoundingBox(x, y, w, h) {
            this.collisionMask = new _sat.Box(new _sat.Vector(0, 0), w, h).toPolygon().translate(x, y);
        }
    }, {
        key: 'setBoundingPolygon',
        value: function setBoundingPolygon(x, y, points) {
            this.collisionMask = new _sat.Polygon(new _sat.Vector(x, y), points.map(function (v) {
                return new _sat.Vector(v[0], v[1]);
            }));
        }
    }, {
        key: 'getTranslatedBounds',
        value: function getTranslatedBounds() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.x;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.y;

            if (this.collisionMask instanceof _sat.Polygon) {
                this.collisionMask.pos.x = x;
                this.collisionMask.pos.y = y;
                return this.collisionMask;
            }
        }
    }, {
        key: 'onScreen',
        value: function onScreen() {
            var _game = this.game,
                camera = _game.camera,
                _game$scene = _game.scene,
                resolutionX = _game$scene.resolutionX,
                resolutionY = _game$scene.resolutionY,
                _game$scene$map = _game$scene.map,
                tilewidth = _game$scene$map.tilewidth,
                tileheight = _game$scene$map.tileheight;
            var x = this.x,
                y = this.y,
                width = this.width,
                height = this.height,
                radius = this.radius;


            if (radius) {
                var cx = x + width / 2;
                var cy = y + height / 2;
                return cx + radius > -camera.x && cy + radius > -camera.y && cx - radius < -camera.x + resolutionX && cy - radius < -camera.y + resolutionY;
            } else {
                return x + width + tilewidth > -camera.x && y + height + tileheight > -camera.y && x - tilewidth < -camera.x + resolutionX && y - tileheight < -camera.y + resolutionY;
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (this.onScreen() && this.sprite && this.visible) {
                var camera = this.game.camera;

                this.sprite.draw(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
            }
        }
    }, {
        key: 'collide',
        value: function collide() /*element, response*/{}
    }, {
        key: 'overlapTest',
        value: function overlapTest(obj) {
            if (this.collisionMask && obj.collisionMask) {
                var response = new _sat.Response();
                if (!this.dead && (this.onScreen() || this.activated) && (0, _sat.testPolygonPolygon)(this.getTranslatedBounds(), obj.getTranslatedBounds(), response)) {
                    this.collide(obj, response);
                    obj.collide(this, response);
                }
                response.clear();
            }
        }
    }, {
        key: 'move',
        value: function move() {
            var _this2 = this;

            var scene = this.game.scene;
            var _scene$map = scene.map,
                tilewidth = _scene$map.tilewidth,
                tileheight = _scene$map.tileheight;


            if (!this.force.x && !this.force.y) return;

            if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed;
            if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed;

            this.expectedX = this.x + this.force.x;
            this.expectedY = this.y + this.force.y;

            if (this.expectedX < 0) this.force.x = 0;
            if (this.expectedY + this.height < 0) this.force.y = 0;

            var PX = Math.round(this.expectedX / tilewidth);
            var PY = Math.round(this.expectedY / tileheight);
            var PW = Math.round((this.expectedX + this.width) / tilewidth);
            var PH = Math.round((this.expectedY + this.height) / tileheight);

            if ((0, _helpers.isValidArray)(this.collisionLayers)) {
                this.collisionLayers.map(function (layerId) {
                    var layer = scene.getLayer(layerId);
                    if (layer.type === _constants.NODE_TYPE.LAYER) {
                        for (var y = PY; y <= PH; y++) {
                            for (var x = PX; x <= PW; x++) {
                                var tile = layer.getTile(x, y);

                                if (tile && tile.isSolid()) {
                                    var isOneWay = tile.isOneWay();
                                    var jumpThrough = !(isOneWay && _this2.force.y < 0 && !_this2.onFloor);
                                    // fix overlaping when force.y is too high
                                    if (_this2.force.y > tileheight / 2) {
                                        _this2.force.y = tileheight / 2;
                                    }
                                    var overlap = tile.overlapTest(_this2.getTranslatedBounds(_this2.x + _this2.force.x, _this2.y + _this2.force.y));
                                    // @fixme
                                    if (overlap.y && jumpThrough) {
                                        _this2.force.y += overlap.y;
                                    } else if (overlap.x && !isOneWay) {
                                        _this2.force.x ? _this2.force.x += overlap.x : _this2.x += overlap.x;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            this.x += this.force.x;
            this.y += this.force.y;

            this.onFloor = this.y < this.expectedY;
            this.onCeiling = this.y > this.expectedY;
        }
    }, {
        key: 'kill',
        value: function kill() {
            this.dead = true;
        }
    }, {
        key: 'getLight',
        value: function getLight() {
            var camera = this.game.camera;

            this.light.position = new _illuminated.Vec2(this.x + this.width / 2 + camera.x, this.y + this.height / 2 + camera.y);
            return this.light;
        }
    }, {
        key: 'getLightMask',
        value: function getLightMask() {
            var camera = this.game.camera;

            var x = this.x + camera.x;
            var y = this.y + camera.y;
            var shadows = [];

            if (this.shape === 'ellipse') {
                shadows.push((0, _helpers.createDiscObject)(x, y, this.width / 2));
            } else {
                // if (this.gid) {
                //     const tile = scene.createTile(this.gid)
                //     tile.collisionLayer.map(({points}) => {
                //         shadows.push(createPolygonObject(x, y, points))
                //     })
                // }
                var _getTranslatedBounds = this.getTranslatedBounds(x, y),
                    pos = _getTranslatedBounds.pos,
                    points = _getTranslatedBounds.points;

                shadows.push((0, _helpers.createPolygonObject)(pos.x, pos.y, points));
            }
            return shadows;
        }
    }, {
        key: 'restore',
        value: function restore() {
            this.activated = false;
            this.dead = false;
            this.animFrame = 0;
        }
    }]);

    return Entity;
}();

exports.default = Entity;
module.exports = exports.default;