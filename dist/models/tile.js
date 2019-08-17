'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sat = require('sat');

var _helpers = require('../helpers');

var _constants = require('../constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function () {
    function Tile(id, x, y, game) {
        _classCallCheck(this, Tile);

        var scene = game.scene;
        var _scene$map = scene.map,
            tilewidth = _scene$map.tilewidth,
            tileheight = _scene$map.tileheight;


        this.id = id;
        this.game = game;
        this.x = x * tilewidth;
        this.y = y * tileheight;
        this.tileset = scene.getTileset(id);
        this.properties = (0, _helpers.getTileProperties)(id, this.tileset);
        this.type = this.properties && this.properties.type || null;
        this.width = this.tileset.tilewidth;
        this.height = this.tileset.tileheight;
        this.terrain = this.getTerrain();
        this.sprite = scene.createSprite(id, {
            gid: id,
            width: this.width,
            height: this.height
        });

        this.collisionMask = this.sprite.getCollisionMask(this.x, this.y);
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
        key: 'draw',
        value: function draw() {
            var _game = this.game,
                camera = _game.camera,
                scene = _game.scene;
            var tileheight = scene.map.tileheight;


            this.sprite.draw(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y + (tileheight - this.height)));
        }
    }]);

    return Tile;
}();

exports.default = Tile;
module.exports = exports.default;