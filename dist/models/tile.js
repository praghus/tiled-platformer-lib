'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sat = require('sat');

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function () {
    function Tile(id, asset, tileset) {
        _classCallCheck(this, Tile);

        // this.game = game
        this.id = id;
        this.animFrame = 0;
        this.asset = asset;
        this.tileset = tileset;
        this.width = tileset.tilewidth;
        this.height = tileset.tileheight;
        this.properties = this.getTileProperties();
        this.type = this.properties && this.properties.type || null;
        this.animation = this.properties && this.properties.animation;
        this.collisionLayer = this.createCollisionLayer();
        this.terrain = this.getTerrain();
        this.frameStart = (0, _helpers.getPerformance)();
        this.then = (0, _helpers.getPerformance)();
    }

    _createClass(Tile, [{
        key: 'collide',
        value: function collide(polygon) {
            if ((0, _helpers.isValidArray)(this.collisionLayer)) {
                var response = new _sat.Response();
                var hasCollision = this.collisionLayer.some(function (shape) {
                    return (0, _sat.testPolygonPolygon)(shape, polygon, response);
                });
                return hasCollision && response;
            }
        }
    }, {
        key: 'createCollisionLayer',
        value: function createCollisionLayer() {
            var objects = this.properties.objects;

            var collisionLayer = [];
            objects && objects.map(function (_ref) {
                var shape = _ref.shape,
                    x = _ref.x,
                    y = _ref.y,
                    width = _ref.width,
                    height = _ref.height,
                    points = _ref.points;

                switch (shape) {
                    case 'polygon':
                        collisionLayer.push(new _sat.Polygon(new _sat.Vector(0, 0), points.map(function (v) {
                            return new _sat.Vector(x + v[0], y + v[1]);
                        })));
                        break;
                    case 'ellipse':
                    case 'rectangle':
                        collisionLayer.push(new _sat.Box(new _sat.Vector(x, y), width, height).toPolygon());
                        break;
                }
            }) || collisionLayer.push(new _sat.Box(new _sat.Vector(0, 0), this.width, this.height).toPolygon());
            return (0, _helpers.isValidArray)(collisionLayer) && collisionLayer || null;
        }
    }, {
        key: 'getTerrain',
        value: function getTerrain() {
            var terrain = this.properties.terrain;

            return terrain && terrain.split(',').map(function (id) {
                return id ? parseInt(id) : null;
            });
        }
    }, {
        key: 'getTileProperties',
        value: function getTileProperties() {
            var id = this.id,
                _tileset = this.tileset,
                firstgid = _tileset.firstgid,
                tiles = _tileset.tiles;

            return (0, _helpers.isValidArray)(tiles) && tiles.filter(function (tile) {
                return tile.id === id - firstgid;
            })[0] || {};
        }
    }, {
        key: 'getSprite',
        value: function getSprite() {
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
            } else return this.id;
        }
    }, {
        key: 'draw',
        value: function draw(ctx, x, y) {
            var _this = this;

            var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var asset = this.asset,
                _tileset2 = this.tileset,
                columns = _tileset2.columns,
                firstgid = _tileset2.firstgid,
                tilewidth = _tileset2.tilewidth,
                tileheight = _tileset2.tileheight;

            var scale = options.scale || 1;
            var debug = !!options.debug;
            var sprite = this.getSprite();

            ctx.drawImage(asset, (sprite - firstgid) % columns * tilewidth, (Math.ceil((sprite - firstgid + 1) / columns) - 1) * tileheight, tilewidth, tileheight, x, y, tilewidth * scale, tileheight * scale);

            (0, _helpers.isValidArray)(this.collisionLayer) && debug && this.collisionLayer.map(function (object) {
                var posX = object.pos.x + x,
                    posY = object.pos.y + y;

                ctx.save();
                ctx.lineWidth = 0.1;
                ctx.strokeStyle = (0, _helpers.isValidArray)(_this.properties.objects) ? '#f0f' : '#ff0';
                if (object instanceof _sat.Polygon) {
                    ctx.beginPath();
                    ctx.moveTo(object.points[0].x + posX, object.points[0].y + posY);
                    object.points.map(function (v) {
                        return ctx.lineTo(posX + v.x, posY + v.y);
                    });
                    ctx.lineTo(object.points[0].x + posX, object.points[0].y + posY);
                    ctx.stroke();
                } else if (object instanceof _sat.Box) {
                    ctx.beginPath();
                    ctx.moveTo(posX, posY);
                    ctx.lineTo(posX + object.w, posY);
                    ctx.lineTo(posX + object.w, posY + object.h);
                    ctx.lineTo(posX, posY + object.h);
                    ctx.lineTo(posX, posY);
                    ctx.stroke();
                }
                ctx.restore();
            });
        }
    }]);

    return Tile;
}();

exports.default = Tile;
module.exports = exports.default;