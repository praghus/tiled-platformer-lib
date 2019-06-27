'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require('./vector');

var _vector2 = _interopRequireDefault(_vector);

var _light = require('./light');

var _light2 = _interopRequireDefault(_light);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Lamp = function (_Light) {
    _inherits(Lamp, _Light);

    function Lamp() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Lamp);

        var _this = _possibleConstructorReturn(this, (Lamp.__proto__ || Object.getPrototypeOf(Lamp)).call(this, options));

        _this.color = options.color || 'rgba(250,220,150,0.8)', _this.radius = options.radius || 0, _this.samples = options.samples || 1, _this.angle = options.angle || 0, _this.roughness = options.roughness || 0;
        return _this;
    }

    _createClass(Lamp, [{
        key: '_getHashCache',
        value: function _getHashCache() {
            return [this.color, this.distance, this.diffuse, this.angle, this.roughness].toString();
        }
    }, {
        key: '_getGradientCache',
        value: function _getGradientCache(center) {
            var hashcode = this._getHashCache();
            if (this._cacheHashcode === hashcode) {
                return this._gcache;
            }
            this._cacheHashcode = hashcode;
            var d = Math.round(this.distance);
            var D = d * 2;
            var cache = (0, _helpers.createCanvasAnd2dContext)(D, D);
            var g = cache.ctx.createRadialGradient(center.x, center.y, 0, d, d, d);
            g.addColorStop(Math.min(1, this.radius / this.distance), this.color);
            g.addColorStop(1, (0, _helpers.getRGBA)(this.color, 0));
            cache.ctx.fillStyle = g;
            cache.ctx.fillRect(0, 0, cache.w, cache.h);
            return this._gcache = cache;
        }
    }, {
        key: 'center',
        value: function center() {
            return new _vector2.default((1 - Math.cos(this.angle) * this.roughness) * this.distance, (1 + Math.sin(this.angle) * this.roughness) * this.distance);
        }
    }, {
        key: 'bounds',
        value: function bounds() {
            var orientationCenter = new _vector2.default(Math.cos(this.angle), -Math.sin(this.angle)).mul(this.roughness * this.distance);
            return {
                topleft: new _vector2.default(this.position.x + orientationCenter.x - this.distance, this.position.y + orientationCenter.y - this.distance),
                bottomright: new _vector2.default(this.position.x + orientationCenter.x + this.distance, this.position.y + orientationCenter.y + this.distance)
            };
        }
    }, {
        key: 'mask',
        value: function mask(ctx) {
            var c = this._getVisibleMaskCache();
            var orientationCenter = new _vector2.default(Math.cos(this.angle), -Math.sin(this.angle)).mul(this.roughness * this.distance);
            ctx.drawImage(c.canvas, Math.round(this.position.x + orientationCenter.x - c.w / 2), Math.round(this.position.y + orientationCenter.y - c.h / 2));
        }
    }, {
        key: 'render',
        value: function render(ctx) {
            var center = this.center();
            var c = this._getGradientCache(center);
            ctx.drawImage(c.canvas, Math.round(this.position.x - center.x), Math.round(this.position.y - center.y));
        }
    }, {
        key: 'forEachSample',
        value: function forEachSample(f) {
            // "spiral" algorithm for spreading emit samples
            for (var s = 0; s < this.samples; ++s) {
                var a = s * (Math.PI * (3 - Math.sqrt(5)));
                var r = Math.sqrt(s / this.samples) * this.radius;
                var delta = new _vector2.default(Math.cos(a) * r, Math.sin(a) * r);
                f(this.position.add(delta));
            }
        }
    }]);

    return Lamp;
}(_light2.default);

exports.default = Lamp;
module.exports = exports.default;