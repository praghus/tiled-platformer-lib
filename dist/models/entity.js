'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = function () {
    function Entity(obj, scene) {
        var _this = this;

        _classCallCheck(this, Entity);

        this._scene = scene;
        this.force = { x: 0, y: 0 };
        this.bounds = null;
        this.acceleration = 0;
        this.maxSpeed = 1;
        this.activated = false;
        this.dead = false;
        this.jump = false;
        this.fall = false;
        this.onFloor = false;
        this.solid = false;
        this.vectorMask = null;
        this.animation = null;
        this.animFrame = 0;
        this.animCount = 0;
        this.states = {};
        this.state = null;

        Object.keys(obj).map(function (prop) {
            _this[prop] = obj[prop];
        });
    }

    _createClass(Entity, [{
        key: 'onScreen',
        value: function onScreen() {
            var _scene = this._scene,
                world = _scene.world,
                camera = _scene.camera,
                viewport = _scene.viewport;
            var resolutionX = viewport.resolutionX,
                resolutionY = viewport.resolutionY;
            var x = this.x,
                y = this.y,
                width = this.width,
                height = this.height;
            var spriteSize = world.spriteSize;

            var bounds = this.getBounds();

            return x + (width || bounds.x + bounds.width) + spriteSize > -camera.x && y + (height || bounds.y + bounds.height) + spriteSize > -camera.y && x + bounds.x - spriteSize < -camera.x + resolutionX && y + bounds.y - spriteSize < -camera.y + resolutionY;
        }
    }, {
        key: 'animate',
        value: function animate() {
            var animation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.animation;

            this.animFrame = this.animFrame || 0;
            this.animCount = this.animCount || 0;

            if (this.animation !== animation) {
                this.animation = animation;
                this.animFrame = 0;
                this.animCount = 0;
            } else if (++this.animCount === Math.round(60 / animation.fps)) {
                if (this.animFrame <= this.animation.frames && animation.loop) {
                    this.animFrame = (0, _helpers.normalize)(this.animFrame + 1, 0, this.animation.frames);
                } else if (this.animFrame < this.animation.frames - 1 && !animation.loop) {
                    this.animFrame += 1;
                }
                this.animCount = 0;
            }
        }
    }, {
        key: 'update',
        value: function update() {
            // update
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _scene2 = this._scene,
                ctx = _scene2.ctx,
                assets = _scene2.assets,
                camera = _scene2.camera;

            if (this.onScreen()) {
                var animation = this.animation,
                    animations = this.animations,
                    animFrame = this.animFrame,
                    width = this.width,
                    height = this.height,
                    visible = this.visible;

                var sprite = assets[this.asset];
                var _ref = [Math.floor(this.x + camera.x), Math.floor(this.y + camera.y)],
                    posX = _ref[0],
                    posY = _ref[1];

                if (visible && sprite) {
                    if (animations) {
                        animation && ctx.drawImage(sprite, animation.x + animFrame * animation.w, animation.y, animation.w, animation.h, posX, posY, animation.w, animation.h);
                    } else {
                        ctx.drawImage(sprite, 0, 0, width, height, posX, posY, width, height);
                    }
                }
            }
        }
    }, {
        key: 'getBounds',
        value: function getBounds() {
            var width = this.width,
                height = this.height;

            return this.bounds || { x: 0, y: 0, width: width, height: height };
        }
    }, {
        key: 'getBoundingRect',
        value: function getBoundingRect() {
            var _getBounds = this.getBounds(),
                x = _getBounds.x,
                y = _getBounds.y,
                width = _getBounds.width,
                height = _getBounds.height;

            return {
                x: this.x + x,
                y: this.y + y,
                width: width, height: height
            };
        }
    }, {
        key: 'setState',
        value: function setState(state) {
            if (this.states.length && this.states.indexOf(state) !== -1) {
                this.state = state;
            }
        }
    }, {
        key: 'overlapTest',
        value: function overlapTest(obj) {
            if (!this.dead && (this.onScreen() || this.activated) && (0, _helpers.overlap)(this.getBoundingRect(), obj.getBoundingRect())) {
                this.collide && this.collide(obj);
                obj.collide && obj.collide(this);
            }
        }
    }, {
        key: 'move',
        value: function move() {
            var world = this._scene.world;
            var spriteSize = world.spriteSize;


            var reducedForceY = this.force.y < spriteSize && this.force.y || spriteSize;

            if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed;
            if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed;

            this.expectedX = this.x + this.force.x;
            this.expectedY = this.y + this.force.y;

            if (this.expectedX < 0) this.force.x = 0;
            if (this.expectedY < 0) this.force.y = 0;

            var _getBounds2 = this.getBounds(),
                boundsX = _getBounds2.x,
                boundsY = _getBounds2.y,
                boundsWidth = _getBounds2.width,
                boundsHeight = _getBounds2.height;

            var boundsSize = { width: boundsWidth, height: boundsHeight };

            var offsetX = this.x + boundsX;
            var offsetY = this.y + boundsY;

            var nextX = _extends({ x: offsetX + this.force.x, y: offsetY }, boundsSize);
            var nextY = _extends({ x: offsetX, y: offsetY + reducedForceY }, boundsSize);

            var PX = Math.floor((this.expectedX + boundsX) / spriteSize);
            var PY = Math.floor((this.expectedY + boundsY) / spriteSize);
            var PW = Math.floor((this.expectedX + boundsX + boundsWidth) / spriteSize);
            var PH = Math.floor((this.expectedY + boundsY + boundsHeight) / spriteSize);

            for (var y = PY; y <= PH; y++) {
                for (var x = PX; x <= PW; x++) {
                    var tile = {
                        x: x * spriteSize,
                        y: y * spriteSize,
                        width: spriteSize,
                        height: spriteSize,
                        jumpThrough: false
                    };
                    if (world.isSolidArea(x, y)) {
                        var isOneWay = world.isOneWayArea(x, y);
                        if (!isOneWay && (0, _helpers.overlap)(nextX, tile)) {
                            if (this.force.x < 0) {
                                this.force.x = tile.x + tile.width - offsetX;
                            } else if (this.force.x > 0) {
                                this.force.x = tile.x - offsetX - boundsWidth;
                            }
                        }
                        if ((0, _helpers.overlap)(nextY, tile)) {
                            if (this.force.y < 0 && !isOneWay) {
                                this.force.y = tile.y + tile.height - offsetY;
                            } else if (this.force.y > 0 && !isOneWay || isOneWay && this.y + this.height <= tile.y) {
                                this.force.y = tile.y - offsetY - boundsHeight;
                            }
                        }
                    }
                }
            }

            this.x += this.force.x;
            this.y += this.force.y;

            this.onCeiling = this.expectedY < this.y;
            this.onFloor = this.expectedY > this.y;
            // todo: remove this
            this.onLeftEdge = !world.isSolidArea(PX, PH);
            this.onRightEdge = !world.isSolidArea(PW, PH);
        }
    }, {
        key: 'kill',
        value: function kill() {
            this.dead = true;
        }
    }, {
        key: 'restore',
        value: function restore() {
            this.activated = false;
            this.dead = false;
            this.animFrame = 0;
            this.animCount = 0;
        }
    }]);

    return Entity;
}();

exports.default = Entity;
module.exports = exports.default;