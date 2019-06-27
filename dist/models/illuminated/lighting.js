'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _light = require('./light');

var _light2 = _interopRequireDefault(_light);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lighting = function () {
    function Lighting() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Lighting);

        this.light = options.light || new _light2.default();
        this.objects = options.objects || [];
    }

    _createClass(Lighting, [{
        key: 'createCache',
        value: function createCache(w, h) {
            this._cache = (0, _helpers.createCanvasAnd2dContext)(w, h);
            this._castcache = (0, _helpers.createCanvasAnd2dContext)(w, h);
        }
    }, {
        key: 'cast',
        value: function cast(ctxoutput) {
            var light = this.light;
            var objects = this.objects;
            var n = light.samples;
            var c = this._castcache;
            var bounds = light.bounds();
            var ctx = c.ctx;
            ctx.clearRect(0, 0, c.w, c.h);
            // Draw shadows for each light sample and objects
            ctx.fillStyle = 'rgba(0,0,0,' + Math.round(100 / n) / 100 + ')';
            light.forEachSample(function (position) {
                for (var o = 0; o < objects.length; ++o) {
                    if (objects[o].contains(position)) {
                        ctx.fillRect(bounds.topleft.x, bounds.topleft.y, bounds.bottomright.x - bounds.topleft.x, bounds.bottomright.y - bounds.topleft.y);
                        return;
                    }
                }
                objects.map(function (object) {
                    return object.cast(ctx, position, bounds);
                });
            });
            // Draw objects diffuse - the intensity of the light penetration in objects
            objects.map(function (object) {
                var diffuse = object.diffuse === undefined ? 0.8 : object.diffuse;
                diffuse *= light.diffuse;
                ctx.fillStyle = 'rgba(0,0,0,' + (1 - diffuse) + ')';
                ctx.beginPath();
                object.path(ctx);
                ctx.fill();
            });
            ctxoutput.drawImage(c.canvas, 0, 0);
        }
    }, {
        key: 'compute',
        value: function compute(w, h) {
            if (!this._cache || this._cache.w !== w || this._cache.h !== h) {
                this.createCache(w, h);
            }
            var ctx = this._cache.ctx;
            ctx.save();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.light.render(ctx);
            ctx.globalCompositeOperation = 'destination-out';
            this.cast(ctx);
            ctx.restore();
        }
    }, {
        key: 'render',
        value: function render(ctx) {
            ctx.drawImage(this._cache.canvas, 0, 0);
        }
    }]);

    return Lighting;
}();

exports.default = Lighting;
module.exports = exports.default;