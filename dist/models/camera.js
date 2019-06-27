"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Camera = function () {
    function Camera(game) {
        _classCallCheck(this, Camera);

        this.game = game;
        this.x = 0;
        this.y = 0;
        this.underground = false;
        this.surface = null;
        this.middlePoint = null;
        this.magnitude = 2;
        this.shakeDirection = 1;
        this.shake = this.shake.bind(this);
        this.scroll = true;
        this.setDefaultMiddlePoint();
    }

    _createClass(Camera, [{
        key: "setDefaultMiddlePoint",
        value: function setDefaultMiddlePoint() {
            if (this.game.props && this.game.props.viewport) {
                var _game$props$viewport = this.game.props.viewport,
                    resolutionX = _game$props$viewport.resolutionX,
                    resolutionY = _game$props$viewport.resolutionY;

                this.setMiddlePoint(resolutionX / 2, resolutionY / 2);
            } else this.setMiddlePoint(0, 0);
        }
    }, {
        key: "setMiddlePoint",
        value: function setMiddlePoint(x, y) {
            this.middlePoint = { x: x, y: y };
        }
    }, {
        key: "setFollow",
        value: function setFollow(follow) {
            var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            this.follow = follow;
            center && this.center();
        }
    }, {
        key: "setSurfaceLevel",
        value: function setSurfaceLevel(level) {
            this.surface = level;
        }
    }, {
        key: "getSurfaceLevel",
        value: function getSurfaceLevel() {
            if (this.game.world && !this.surface) {
                return this.game.world.height;
            }
            return this.surface;
        }
    }, {
        key: "update",
        value: function update() {
            if (!this.game.world || !this.follow) {
                return;
            }
            var _game = this.game,
                _game$world = _game.world,
                width = _game$world.width,
                height = _game$world.height,
                spriteSize = _game$world.spriteSize,
                _game$props$viewport2 = _game.props.viewport,
                resolutionX = _game$props$viewport2.resolutionX,
                resolutionY = _game$props$viewport2.resolutionY;


            var surface = this.getSurfaceLevel();

            if (this.scroll) {
                this.y = -(this.follow.y + this.follow.height / 2 - this.middlePoint.y);
                var move = Math.round((this.follow.x + this.follow.width / 2 + this.x - this.middlePoint.x) / (resolutionX / 10));
                if (move !== 0) {
                    this.x -= move;
                }
                if (this.follow.force.x !== 0) {
                    this.x -= this.follow.force.x;
                }
                if (this.x - resolutionX < -width * spriteSize) {
                    this.x = -width * spriteSize + resolutionX;
                }
                if (this.y - resolutionY < -height * spriteSize) {
                    this.y = -height * spriteSize + resolutionY;
                }
            } else {
                var xx = Math.round((this.follow.x + this.follow.width / 2) / resolutionX) - 1;
                var yy = Math.round((this.follow.y - this.follow.height) / resolutionY) - 1;

                this.x = -(resolutionX * xx) - resolutionX / 2;
                this.y = -(resolutionY * yy) - resolutionX / 2;
            }
            // above the surface
            if (Math.round((this.follow.y + this.follow.height / 2) / spriteSize) < surface) {
                this.underground = false;
                if (this.scroll && this.y - resolutionY < -surface * spriteSize) {
                    this.y = -surface * spriteSize + resolutionY;
                }
            }
            // under the surface
            else {
                    this.underground = true;
                    if (this.scroll && this.y > -surface * spriteSize) {
                        this.y = -surface * spriteSize;
                    }
                }
            // shake
            if (this.magnitude !== 2) {
                if (this.shakeDirection === 1) this.y += this.magnitude;else if (this.shakeDirection === 2) this.x += this.magnitude;else if (this.shakeDirection === 3) this.y -= this.magnitude;else this.x -= this.magnitude;
                this.shakeDirection = this.shakeDirection < 4 ? this.shakeDirection + 1 : 1;
            }

            if (this.x > 0) this.x = 0;
            if (this.y > 0) this.y = 0;
        }
    }, {
        key: "center",
        value: function center() {
            if (this.follow) {
                this.x = -(this.follow.x + this.follow.width / 2 - this.middlePoint.x);
                this.y = -(this.follow.y + this.follow.height - this.middlePoint.y);
            }
        }
    }, {
        key: "shake",
        value: function shake() {
            if (this.magnitude < 0) {
                this.magnitude = 2;
                return;
            }
            this.magnitude -= 0.2;
            setTimeout(this.shake, 50);
        }
    }]);

    return Camera;
}();

exports.default = Camera;
module.exports = exports.default;