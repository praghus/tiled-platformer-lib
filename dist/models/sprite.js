'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sprite = function () {
    function Sprite(props, game) {
        _classCallCheck(this, Sprite);

        var animation = props.animation,
            gid = props.gid,
            asset = props.asset,
            width = props.width,
            height = props.height;


        this.game = game;
        this.asset = asset;
        this.gid = gid;
        this.tile = gid && game.scene.createTile(gid);
        this.height = height;
        this.width = width;
        this.animation = animation;
        this.animFrame = 0;
        this.then = (0, _helpers.getPerformance)();
        this.frameStart = (0, _helpers.getPerformance)();
    }

    _createClass(Sprite, [{
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
        value: function draw(x, y) {
            var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
            var animation = this.animation,
                animFrame = this.animFrame,
                game = this.game,
                tile = this.tile,
                width = this.width,
                height = this.height;
            var ctx = game.ctx,
                assets = game.scene.assets;

            var sprite = assets[this.asset];

            if (tile) {
                tile.draw(x, y, scale);
            } else if (animation) {
                var frames = animation.frames,
                    strip = animation.strip;

                var posX = strip ? strip.x + animFrame * animation.width : (0, _helpers.isValidArray)(frames) && frames[animFrame][0];
                var posY = strip ? strip.y : (0, _helpers.isValidArray)(frames) && frames[animFrame][1];

                ctx.drawImage(sprite, posX, posY, animation.width, animation.height, x, y, animation.width * scale, animation.height * scale);
            } else if (sprite) {
                ctx.drawImage(sprite, 0, 0, width, height, x, y, width * scale, height * scale);
            }
        }
    }]);

    return Sprite;
}();

exports.default = Sprite;
module.exports = exports.default;