'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function () {
    function Tile(id, properties) {
        _classCallCheck(this, Tile);

        this.id = id - 1;
        this.animFrame = 0;
        this.animCount = 0;
        this.properties = properties;
        this.animation = this.getAnimation();
        this.terrain = this.getTerrain();
    }

    _createClass(Tile, [{
        key: 'getAnimation',
        value: function getAnimation() {
            var props = this.getTileProperties();
            return props && props.animation;
        }
    }, {
        key: 'getTerrain',
        value: function getTerrain() {
            var props = this.getTileProperties();
            return props && props.terrain && props.terrain.split(',').map(function (id) {
                return id ? parseInt(id) : null;
            });
        }
    }, {
        key: 'getTileProperties',
        value: function getTileProperties() {
            var id = this.id,
                tiles = this.properties.tileset.tiles;

            return (0, _helpers.isValidArray)(tiles) && tiles.filter(function (tile) {
                return tile.id === id;
            })[0];
        }
    }, {
        key: 'getSprite',
        value: function getSprite() {
            if (this.animation && this.animation.frames) {
                var duration = 1000 / parseInt(this.animation.frames[this.animFrame].duration);
                if (++this.animCount === Math.round(60 / duration)) {
                    if (this.animFrame <= this.animation.frames.length) {
                        this.animFrame = (0, _helpers.normalize)(this.animFrame + 1, 0, this.animation.frames.length);
                    }
                    this.animCount = 0;
                }
                return this.animation.frames[this.animFrame].tileid + 1;
            } else return this.id + 1;
        }
    }, {
        key: 'draw',
        value: function draw(x, y, ctx) {
            var _properties = this.properties,
                asset = _properties.asset,
                _properties$tileset = _properties.tileset,
                columns = _properties$tileset.columns,
                firstgid = _properties$tileset.firstgid,
                tilewidth = _properties$tileset.tilewidth,
                tileheight = _properties$tileset.tileheight;


            var sprite = this.getSprite();

            ctx.drawImage(asset, (sprite - firstgid) % columns * tilewidth, (Math.ceil((sprite - firstgid + 1) / columns) - 1) * tileheight, tilewidth, tileheight, x, y, tilewidth, tileheight);
        }
    }]);

    return Tile;
}();

exports.default = Tile;
module.exports = exports.default;