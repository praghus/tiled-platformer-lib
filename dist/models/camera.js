"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Camera = function () {
    function Camera(scene) {
        _classCallCheck(this, Camera);

        this._scene = scene;
        this.x = 0;
        this.y = 0;
        this.underground = false;
        this.magnitude = 2;
        this.shakeDirection = 1;
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
        key: "update",
        value: function update() {
            var _scene = this._scene,
                world = _scene.world,
                viewport = _scene.viewport;
            var resolutionX = viewport.resolutionX,
                resolutionY = viewport.resolutionY;
            var spriteSize = world.spriteSize,
                surface = world.surface;


            this.y = -(this.follow.y + this.follow.height / 2 - resolutionY / 2);

            if (this.follow.x + this.follow.width / 2 + this.x > resolutionX / 2) {
                this.x -= this.follow.force.x > 0 ? this.follow.force.x : 0.5;
            }
            if (this.follow.x + this.follow.width / 2 + this.x < resolutionX / 2) {
                this.x -= this.follow.force.x < 0 ? this.follow.force.x : -0.5;
            }
            if (this.x - resolutionX < -world.width * spriteSize) {
                this.x = -world.width * spriteSize + resolutionX;
            }
            if (this.y - resolutionY < -world.height * spriteSize) {
                this.y = -world.height * spriteSize + resolutionY;
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
            var viewport = this._scene.viewport;

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