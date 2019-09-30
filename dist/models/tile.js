'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sat = require('sat');

var _helpers = require('../helpers');

var _constants = require('../constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function () {
    function Tile(id, game) {
        _classCallCheck(this, Tile);

        var scene = game.scene;

        this.id = id;
        this.game = game;
        this.tileset = scene.getTileset(id);
        this.properties = (0, _helpers.getTileProperties)(id, this.tileset);
        this.type = this.properties && this.properties.type || null;
        this.width = this.tileset.tilewidth;
        this.height = this.tileset.tileheight;
        this.asset = game.scene.assets[(0, _helpers.getFilename)(this.tileset.image.source)];
        this.animation = this.properties && this.properties.animation;
        this.animFrame = 0;
        this.then = (0, _helpers.getPerformance)();
        this.frameStart = (0, _helpers.getPerformance)();
        this.terrain = this.getTerrain();
        this.collisionMask = this.getCollisionMask();
    }

    _createClass(Tile, [{
        key: 'overlapTest',
        value: function overlapTest(polygon) {
            if (polygon instanceof _sat.Polygon) {
                var response = new _sat.Response();
                var hasCollision = this.collisionMask.some(function (shape) {
                    return (0, _sat.testPolygonPolygon)(shape, polygon, response);
                });
                response.clear();
                return hasCollision && response.overlapV;
            }
        }
    }, {
        key: 'isSolid',
        value: function isSolid() {
            return this.type !== _constants.TILE_TYPE.NON_COLLIDING;
        }
    }, {
        key: 'isOneWay',
        value: function isOneWay() {
            return this.type === _constants.TILE_TYPE.ONE_WAY;
        }
    }, {
        key: 'isInvisible',
        value: function isInvisible() {
            return this.type === _constants.TILE_TYPE.INVISIBLE;
        }
    }, {
        key: 'isShadowCaster',
        value: function isShadowCaster() {
            return this.isSolid() && !this.isOneWay();
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
        key: 'getNextGid',
        value: function getNextGid() {
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
        key: 'getCollisionMask',
        value: function getCollisionMask() {
            var posX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var posY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var objects = (0, _helpers.getProperties)(this, 'objects');
            return (0, _helpers.isValidArray)(objects) ? objects.map(function (_ref) {
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
        }
    }, {
        key: 'draw',
        value: function draw(x, y) {
            var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            if (!this.isInvisible()) {
                var asset = this.asset,
                    ctx = this.game.ctx,
                    _tileset = this.tileset,
                    columns = _tileset.columns,
                    firstgid = _tileset.firstgid,
                    tilewidth = _tileset.tilewidth,
                    tileheight = _tileset.tileheight;


                var tileGid = this.getNextGid();
                var posX = (tileGid - firstgid) % columns * tilewidth;
                var posY = (Math.ceil((tileGid - firstgid + 1) / columns) - 1) * tileheight;

                ctx.drawImage(asset, posX, posY, tilewidth, tileheight, x, y, tilewidth * scale, tileheight * scale);
            }
        }
    }]);

    return Tile;
}();

exports.default = Tile;
module.exports = exports.default;