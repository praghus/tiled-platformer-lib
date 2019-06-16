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
        this.magnitude = 2;
        this.shakeDirection = 1;
        this.middlePoint = {
            x: 0,
            y: 0
        };
        this.shake = this.shake.bind(this);
    }

    _createClass(Camera, [{
        key: "setFollow",
        value: function setFollow(follow) {
            var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            this.follow = follow;
            center && this.center();
        }
    }, {
        key: "setMiddlePoint",
        value: function setMiddlePoint(x, y) {
            this.middlePoint = { x: x, y: y };
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
                _game$props$viewport = _game.props.viewport,
                resolutionX = _game$props$viewport.resolutionX,
                resolutionY = _game$props$viewport.resolutionY;


            var surface = this.getSurfaceLevel();

            this.y = -(this.follow.y + this.follow.height / 2 - this.middlePoint.y);

            if (this.follow.x + this.follow.width / 2 + this.x > this.middlePoint.x) {
                this.x -= this.follow.force.x > 0 ? this.follow.force.x : 0.5;
            }
            if (this.follow.x + this.follow.width / 2 + this.x < this.middlePoint.x) {
                this.x -= this.follow.force.x < 0 ? this.follow.force.x : -0.5;
            }
            if (this.x - resolutionX < -width * spriteSize) {
                this.x = -width * spriteSize + resolutionX;
            }
            if (this.y - resolutionY < -height * spriteSize) {
                this.y = -height * spriteSize + resolutionY;
            }
            // above the surface
            if (Math.round((this.follow.y + this.follow.height / 2) / spriteSize) < surface) {
                this.underground = false;
                if (this.y - resolutionY < -surface * spriteSize) {
                    this.y = -surface * spriteSize + resolutionY;
                }
            }
            // under the surface
            else {
                    this.underground = true;
                    if (this.y > -surface * spriteSize) {
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
            var viewport = this.game.props.viewport;

            if (viewport && this.follow) {
                var resolutionX = viewport.resolutionX,
                    resolutionY = viewport.resolutionY;

                this.x = -(this.follow.x + this.follow.width / 2 - resolutionX / 2);
                this.y = -(this.follow.y + this.follow.height - resolutionY / 2);
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