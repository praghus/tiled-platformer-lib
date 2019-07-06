'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _illuminated = require('./illuminated');

var _constants = require('../constants');

var _sat = require('sat');

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = function () {
    function Entity(obj, game) {
        var _this = this;

        _classCallCheck(this, Entity);

        this.game = game;
        this.bounds = null;
        this.speed = 0;
        this.maxSpeed = 1;
        this.activated = false;
        this.dead = false;
        this.onFloor = false;
        this.solid = false;
        this.shadowCaster = false;
        this.vectorMask = null;
        this.animation = null;
        this.collisionLayers = null;
        this.states = null;
        this.animFrame = 0;
        this.force = new _sat.Vector(0, 0);
        this.initialPosition = new _sat.Vector(obj.x, obj.y);
        this.frameStart = (0, _helpers.getPerformance)();
        this.then = (0, _helpers.getPerformance)();
        this.setBoundingBox(0, 0, obj.width, obj.height);
        Object.keys(obj).map(function (prop) {
            _this[prop] = obj[prop];
        });
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
            this.bounds = new _sat.Box(new _sat.Vector(x, y), w, h);
        }
    }, {
        key: 'setBoundingPolygon',
        value: function setBoundingPolygon(x, y, points) {
            this.bounds = new _sat.Polygon(new _sat.Vector(x, y), points.map(function (v) {
                return new _sat.Vector(v[0], v[1]);
            }));
        }
    }, {
        key: 'getTranslatedBounds',
        value: function getTranslatedBounds() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.x;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.y;

            if (this.bounds) {
                var _bounds = this.bounds,
                    pos = _bounds.pos,
                    w = _bounds.w,
                    h = _bounds.h;

                return new _sat.Box(new _sat.Vector(pos.x + x, pos.y + y), w, h).toPolygon();
            }
            return new _sat.Box(new _sat.Vector(x, y), this.width, this.height).toPolygon();
        }
    }, {
        key: 'onScreen',
        value: function onScreen() {
            var _game = this.game,
                camera = _game.camera,
                spriteSize = _game.world.spriteSize,
                _game$props$viewport = _game.props.viewport,
                resolutionX = _game$props$viewport.resolutionX,
                resolutionY = _game$props$viewport.resolutionY;
            var x = this.x,
                y = this.y,
                width = this.width,
                height = this.height;


            return x + width + spriteSize > -camera.x && y + height + spriteSize > -camera.y && x - spriteSize < -camera.x + resolutionX && y - spriteSize < -camera.y + resolutionY;
        }
    }, {
        key: 'animate',
        value: function animate() {
            var animation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.animation;

            this.animFrame = this.animFrame || 0;
            this.frameStart = (0, _helpers.getPerformance)();

            if (this.animation !== animation) {
                this.animation = animation;
                this.animFrame = 0;
            }

            var duration = animation.strip ? animation.strip.duration : (0, _helpers.isValidArray)(animation.frames) && animation.frames[this.animFrame][2];

            var framesCount = animation.strip ? animation.strip.frames : (0, _helpers.isValidArray)(animation.frames) && animation.frames.length;

            if (this.frameStart - this.then > duration) {
                if (this.animFrame <= framesCount && animation.loop) {
                    this.animFrame = (0, _helpers.normalize)(this.animFrame + 1, 0, framesCount);
                } else if (this.animFrame < framesCount - 1 && !animation.loop) {
                    this.animFrame += 1;
                }
                this.then = (0, _helpers.getPerformance)();
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (this.onScreen() && this.visible) {
                var _game2 = this.game,
                    ctx = _game2.ctx,
                    camera = _game2.camera,
                    world = _game2.world,
                    assets = _game2.props.assets;
                var animation = this.animation,
                    animFrame = this.animFrame,
                    gid = this.gid,
                    width = this.width,
                    height = this.height;

                var sprite = assets[this.asset];
                var posX = this.x + camera.x,
                    posY = this.y + camera.y;

                if (animation) {
                    var frames = animation.frames,
                        strip = animation.strip;

                    var x = strip ? strip.x + animFrame * animation.width : (0, _helpers.isValidArray)(frames) && frames[animFrame][0];
                    var y = strip ? strip.y : (0, _helpers.isValidArray)(frames) && frames[animFrame][1];

                    ctx.drawImage(sprite, x, y, animation.width, animation.height, posX, posY, animation.width, animation.height);
                } else if (gid) {
                    world.createTile(gid).draw(ctx, posX, posY);
                } else if (sprite) {
                    ctx.drawImage(sprite, 0, 0, width, height, posX, posY, width, height);
                }
            }
        }
    }, {
        key: 'collide',
        value: function collide() /*obj, response*/{
            // if (obj.visible && obj.properties && obj.properties.solid) {
            // //     obj.force.x += force.x
            // //     obj.force.y += force.y
            //     this.force.x -= force.x
            //     this.force.y -= force.y
            // }
        }
    }, {
        key: 'overlapTest',
        value: function overlapTest(obj) {
            var response = new _sat.Response();
            if (!this.dead && (this.onScreen() || this.activated) && (0, _sat.testPolygonPolygon)(this.getTranslatedBounds(), obj.getTranslatedBounds(), response)) {
                this.collide(obj, response);
                obj.collide(this, response);
            }
        }
    }, {
        key: 'move',
        value: function move() {
            var _this2 = this;

            var world = this.game.world;


            if (!this.force.x && !this.force.y) return;
            if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed;
            if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed;
            //if (this.force.y > world.spriteSize / 2) this.force.y = world.spriteSize / 2
            if (this.x + this.force.x < 0) this.force.x = 0;
            if (this.y + this.force.y < 0) this.force.y = 0;

            this.expectedX = this.x + this.force.x;
            this.expectedY = this.y + this.force.y;

            var PX = Math.floor(this.expectedX / world.spriteSize);
            var PY = Math.floor(this.expectedY / world.spriteSize);
            var PW = Math.floor((this.expectedX + this.width) / world.spriteSize);
            var PH = Math.floor((this.expectedY + this.height) / world.spriteSize);

            if ((0, _helpers.isValidArray)(this.collisionLayers)) {
                this.collisionLayers.map(function (layer) {
                    for (var y = PY; y <= PH; y++) {
                        for (var x = PX; x <= PW; x++) {
                            var t = world.getTile(x, y, layer);
                            if (world.isSolidTile(t)) {
                                var td = world.tiles[t];
                                var tileX = x * td.width;
                                var tileY = y * td.height;
                                var isOneWay = td.type === _constants.TILE_TYPE.ONE_WAY;
                                var jumpThrough = !(isOneWay && _this2.force.y < 0 && !_this2.onFloor);
                                var ccY = td.collide(_this2.getTranslatedBounds(_this2.x - tileX, _this2.expectedY - tileY));
                                var ccX = td.collide(_this2.getTranslatedBounds(_this2.expectedX - tileX, _this2.y - tileY));
                                if (ccY && _this2.force.y !== 0 && jumpThrough) {
                                    // fix overlaping when force.y is loo large
                                    if (_this2.force.y > world.spriteSize / 2) {
                                        _this2.force.y = world.spriteSize / 2;
                                    }
                                    _this2.force.y += ccY.overlapV.y;
                                }
                                if (ccX) {
                                    if (Math.abs(ccX.overlapV.y) && jumpThrough) {
                                        _this2.force.y += ccX.overlapV.y;
                                    } else if (_this2.force.x !== 0 && !isOneWay) {
                                        _this2.force.x += ccX.overlapV.x;
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
            // if (this.onFloor) this.force.y = 0
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
            var _game3 = this.game,
                camera = _game3.camera,
                world = _game3.world;

            var x = this.x + camera.x;
            var y = this.y + camera.y;
            var shadows = [];

            if (this.shape === 'ellipse') {
                shadows.push((0, _helpers.createDiscObject)(x, y, this.width / 2));
            } else {
                if (this.gid) {
                    var tile = world.createTile(this.gid);
                    tile.collisionLayer.map(function (_ref) {
                        var points = _ref.points;

                        shadows.push((0, _helpers.createPolygonObject)(x, y, points));
                    });
                }

                var _getTranslatedBounds = this.getTranslatedBounds(x, this.expectedY),
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