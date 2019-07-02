'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vec = require('./vec2');

var _vec2 = _interopRequireDefault(_vec);

var _opaqueObject = require('./opaque-object');

var _opaqueObject2 = _interopRequireDefault(_opaqueObject);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DiscObject = function (_OpaqueObject) {
    _inherits(DiscObject, _OpaqueObject);

    function DiscObject() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, DiscObject);

        var _this = _possibleConstructorReturn(this, (DiscObject.__proto__ || Object.getPrototypeOf(DiscObject)).call(this, options));

        _this.center = options.center || new _vec2.default(), _this.radius = options.radius || 20;
        return _this;
    }

    _createClass(DiscObject, [{
        key: 'cast',
        value: function cast(ctx, origin, bounds) {
            var m = this.center;
            var originToM = m.sub(origin);
            var tangentLines = this.getTan2(this.radius, originToM);
            var originToA = tangentLines[0];
            var originToB = tangentLines[1];
            var a = originToA.add(origin);
            var b = originToB.add(origin);

            // normalize to distance
            var distance = (bounds.bottomright.x - bounds.topleft.x + (bounds.bottomright.y - bounds.topleft.y)) / 2;

            originToM = originToM.normalize().mul(distance);
            originToA = originToA.normalize().mul(distance);
            originToB = originToB.normalize().mul(distance);

            // project points
            var oam = a.add(originToM);
            var obm = b.add(originToM);
            var ap = a.add(originToA);
            var bp = b.add(originToB);

            var start = Math.atan2(originToM.x, -originToM.y);
            ctx.beginPath();
            (0, _helpers.path)(ctx, [b, bp, obm, oam, ap, a], true);
            ctx.arc(m.x, m.y, this.radius, start, start + Math.PI);
            ctx.fill();
        }
    }, {
        key: 'path',
        value: function path(ctx) {
            ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        }
    }, {
        key: 'bounds',
        value: function bounds() {
            return {
                topleft: new _vec2.default(this.center.x - this.radius, this.center.y - this.radius),
                bottomright: new _vec2.default(this.center.x + this.radius, this.center.y + this.radius)
            };
        }
    }, {
        key: 'contains',
        value: function contains(point) {
            return point.dist2(this.center) < this.radius * this.radius;
        }
    }, {
        key: 'getTan2',
        value: function getTan2(radius, center) {
            var epsilon = this.epsilon || 1e-6;

            var x0 = void 0;
            var y0 = void 0;
            var len2 = void 0;
            var soln = void 0;
            var solutions = [];

            var a = radius;
            if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' && typeof center === 'number') {
                var tmp = a;
                center = a;
                center = tmp; // swap
            }
            if (typeof center === 'number') {
                x0 = center;
                y0 = arguments[2];
                len2 = x0 * x0 + y0 * y0;
            } else {
                x0 = center.x;
                y0 = center.y;
                len2 = center.length2();
            }
            // t = +/- Math.acos( (-a*x0 +/- y0 * Math.sqrt(x0*x0 + y0*y0 - a*a))/(x0*x0 + y0*y) );
            var len2a = y0 * Math.sqrt(len2 - a * a);
            var tt = Math.acos((-a * x0 + len2a) / len2);
            var nt = Math.acos((-a * x0 - len2a) / len2);
            var tt_cos = a * Math.cos(tt);
            var tt_sin = a * Math.sin(tt);
            var nt_cos = a * Math.cos(nt);
            var nt_sin = a * Math.sin(nt);

            // Note: cos(-t) == cos(t) and sin(-t) == -sin(t) for all t, so find
            // x0 + a*cos(t), y0 +/- a*sin(t)
            // Solutions have equal lengths
            soln = new _vec2.default(x0 + nt_cos, y0 + nt_sin);
            solutions.push(soln);
            var dist0 = soln.length2();

            soln = new _vec2.default(x0 + tt_cos, y0 - tt_sin);
            solutions.push(soln);
            var dist1 = soln.length2();
            if (Math.abs(dist0 - dist1) < epsilon) return solutions;

            soln = new _vec2.default(x0 + nt_cos, y0 - nt_sin);
            solutions.push(soln);
            var dist2 = soln.length2();
            // Changed order so no strange X of light inside the circle. Could also sort results.
            if (Math.abs(dist1 - dist2) < epsilon) return [soln, solutions[1]];
            if (Math.abs(dist0 - dist2) < epsilon) return [solutions[0], soln];

            soln = new _vec2.default(x0 + tt_cos, y0 + tt_sin);
            solutions.push(soln);
            var dist3 = soln.length2();
            if (Math.abs(dist2 - dist3) < epsilon) return [solutions[2], soln];
            if (Math.abs(dist1 - dist3) < epsilon) return [solutions[1], soln];
            if (Math.abs(dist0 - dist3) < epsilon) return [solutions[0], soln];

            // return all 4 solutions if no matching vector lengths found.
            return solutions;
        }
    }]);

    return DiscObject;
}(_opaqueObject2.default);

exports.default = DiscObject;
module.exports = exports.default;