'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('../../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DarkMask = function () {
    function DarkMask() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, DarkMask);

        this.color = options.color || 'rgba(0,0,0,1)';
        this.lights = options.lights || [];
    }

    _createClass(DarkMask, [{
        key: 'compute',
        value: function compute(w, h) {
            if (!this._cache || this._cache.w !== w || this._cache.h !== h) {
                this._cache = (0, _helpers.createCanvasAnd2dContext)('dm', w, h);
            }
            var ctx = this._cache.ctx;
            ctx.save();
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'destination-out';
            this.lights.map(function (light) {
                return light.mask(ctx);
            });
            ctx.restore();
        }
    }, {
        key: 'render',
        value: function render(ctx) {
            ctx.drawImage(this._cache.canvas, 0, 0);
        }
    }]);

    return DarkMask;
}();

exports.default = DarkMask;
module.exports = exports.default;