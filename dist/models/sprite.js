'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sat = require('sat');

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sprite = function () {
    function Sprite(props, game) {
        _classCallCheck(this, Sprite);

        var animation = props.animation,
            asset = props.asset,
            gid = props.gid,
            width = props.width,
            height = props.height;


        this.game = game;
        this.gid = gid;
        this.animFrame = 0;
        this.then = (0, _helpers.getPerformance)();
        this.frameStart = (0, _helpers.getPerformance)();

        if (gid) {
            this.tileset = game.scene.getTileset(gid);
            this.width = this.tileset.tilewidth;
            this.height = this.tileset.tileheight;
            this.asset = game.scene.assets[(0, _helpers.getFilename)(this.tileset.image.source)];
            this.properties = (0, _helpers.getTileProperties)(gid, this.tileset);
            this.animation = this.properties && this.properties.animation;
        } else {
            this.asset = asset;
            this.height = height;
            this.width = width;
            this.animation = animation;
        }
    }

    _createClass(Sprite, [{
        key: 'getTileGid',
        value: function getTileGid() {
            var firstgid = this.tileset.firstgid;

            if (this.animation && this.animation.frames) {
                this.frameStart = (0, _helpers.getPerformance)();
                var duration = this.animation.frames[this.animFrame].duration;
                if (this.frameStart - this.then > duration) {
                    if (this.animFrame <= this.animation.frames.length) {
                        this.animFrame = (0, _helpers.normalize)(this.animFrame + 1, 0, this.animation.frames.length);
                    }
                    this.then = (0, _helpers.getPerformance)();
                }
                return this.animation.frames[this.animFrame].tileid + firstgid;
            } else return this.gid;
        }
    }, {
        key: 'getCollisionMask',
        value: function getCollisionMask(posX, posY) {
            var objects = (0, _helpers.getProperties)(this, 'objects');
            var collisionMask = (0, _helpers.isValidArray)(objects) ? objects.map(function (_ref) {
                var shape = _ref.shape,
                    x = _ref.x,
                    y = _ref.y,
                    width = _ref.width,
                    height = _ref.height,
                    points = _ref.points;
                return shape === 'polygon' ? new _sat.Polygon(new _sat.Vector(posX, posY), points.map(function (_ref2) {
                    var _ref3 = _slicedToArray(_ref2, 2),
                        x1 = _ref3[0],
                        y1 = _ref3[1];

                    return new _sat.Vector(x + x1, y + y1);
                })) : new _sat.Box(new _sat.Vector(posX + x, posY + y), width, height).toPolygon();
            }) : [new _sat.Box(new _sat.Vector(posX, posY), this.width, this.height).toPolygon()];

            return collisionMask;
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
        value: function draw(x, y) {
            var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
            var animation = this.animation,
                animFrame = this.animFrame,
                game = this.game,
                gid = this.gid,
                width = this.width,
                height = this.height;
            var ctx = game.ctx,
                assets = game.scene.assets;

            var sprite = assets[this.asset];

            if (gid) {
                var asset = this.asset,
                    _tileset = this.tileset,
                    columns = _tileset.columns,
                    firstgid = _tileset.firstgid,
                    tilewidth = _tileset.tilewidth,
                    tileheight = _tileset.tileheight;


                var tileGid = this.getTileGid();
                var posX = (tileGid - firstgid) % columns * tilewidth;
                var posY = (Math.ceil((tileGid - firstgid + 1) / columns) - 1) * tileheight;

                ctx.drawImage(asset, posX, posY, tilewidth, tileheight, x, y, tilewidth * scale, tileheight * scale);
            } else if (animation) {
                var frames = animation.frames,
                    strip = animation.strip;

                var _posX = strip ? strip.x + animFrame * animation.width : (0, _helpers.isValidArray)(frames) && frames[animFrame][0];
                var _posY = strip ? strip.y : (0, _helpers.isValidArray)(frames) && frames[animFrame][1];

                ctx.drawImage(sprite, _posX, _posY, animation.width, animation.height, x, y, animation.width * scale, animation.height * scale);
            } else if (sprite) {
                ctx.drawImage(sprite, 0, 0, width, height, x, y, width * scale, height * scale);
            }
        }
    }]);

    return Sprite;
}();

exports.default = Sprite;
module.exports = exports.default;