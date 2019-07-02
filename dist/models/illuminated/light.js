'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vec = require('./vec2');

var _vec2 = _interopRequireDefault(_vec);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Light = function () {
    function Light() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Light);

        this.position = options.position || new _vec2.default(), this.distance = options.distance || 100, this.diffuse = options.diffuse || 0.8;
    }

    _createClass(Light, [{
        key: 'mask',
        value: function mask(ctx) {
            var c = this._getVisibleMaskCache();
            ctx.drawImage(c.canvas, Math.round(this.position.x - c.w / 2), Math.round(this.position.y - c.h / 2));
        }
    }, {
        key: 'bounds',
        value: function bounds() {
            return {
                topleft: new _vec2.default(this.position.x - this.distance, this.position.y - this.distance),
                bottomright: new _vec2.default(this.position.x + this.distance, this.position.y + this.distance)
            };
        }
    }, {
        key: 'center',
        value: function center() {
            return new _vec2.default(this.distance, this.distance);
        }
    }, {
        key: 'forEachSample',
        value: function forEachSample() {
            var f = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _helpers.noop;

            f(this.position);
        }
    }, {
        key: '_getVisibleMaskCache',
        value: function _getVisibleMaskCache() {
            // By default use a radial gradient based on the distance
            var d = Math.floor(this.distance * 1.4);
            var hash = '' + d;
            if (this.vismaskhash !== hash) {
                this.vismaskhash = hash;
                var c = this._vismaskcache = (0, _helpers.createCanvasAnd2dContext)('vm' + this.id, 2 * d, 2 * d);
                var g = c.ctx.createRadialGradient(d, d, 0, d, d, d);
                g.addColorStop(0, 'rgba(0,0,0,1)');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                c.ctx.fillStyle = g;
                c.ctx.fillRect(0, 0, c.w, c.h);
            }
            return this._vismaskcache;
        }
    }]);

    return Light;
}();

exports.default = Light;
module.exports = exports.default;