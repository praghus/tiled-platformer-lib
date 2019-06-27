'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require('./vector');

var _vector2 = _interopRequireDefault(_vector);

var _opaqueObject = require('./opaque-object');

var _opaqueObject2 = _interopRequireDefault(_opaqueObject);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PolygonObject = function (_OpaqueObject) {
    _inherits(PolygonObject, _OpaqueObject);

    function PolygonObject() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, PolygonObject);

        var _this = _possibleConstructorReturn(this, (PolygonObject.__proto__ || Object.getPrototypeOf(PolygonObject)).call(this, options));

        _this.points = options.points || [];
        return _this;
    }

    _createClass(PolygonObject, [{
        key: '_forEachVisibleEdges',
        value: function _forEachVisibleEdges(origin, bounds, f) {
            var a = this.points[this.points.length - 1];
            var b = void 0;
            for (var p = 0; p < this.points.length; ++p, a = b) {
                b = this.points[p];
                if (a.inBound(bounds.topleft, bounds.bottomright)) {
                    var originToA = a.sub(origin);
                    var originToB = b.sub(origin);
                    var aToB = b.sub(a);
                    var normal = new _vector2.default(aToB.y, -aToB.x);
                    if (normal.dot(originToA) < 0) {
                        f(a, b, originToA, originToB, aToB);
                    }
                }
            }
        }
    }, {
        key: 'bounds',
        value: function bounds() {
            var topleft = this.points[0].copy();
            var bottomright = topleft.copy();
            for (var p = 1; p < this.points.length; ++p) {
                var point = this.points[p];
                if (point.x > bottomright.x) bottomright.x = point.x;
                if (point.y > bottomright.y) bottomright.y = point.y;
                if (point.x < topleft.x) topleft.x = point.x;
                if (point.y < topleft.y) topleft.y = point.y;
            }
            return {
                topleft: topleft,
                bottomright: bottomright
            };
        }
    }, {
        key: 'contains',
        value: function contains(p) {
            var points = this.points;
            var x = p.x;
            var y = p.y;
            var j = points.length - 1;
            var oddNodes = false;

            for (var i = 0; i < points.length; i++) {
                if ((points[i].y < y && points[j].y >= y || points[j].y < y && points[i].y >= y) && (points[i].x <= x || points[j].x <= x)) {
                    if (points[i].x + (y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < x) {
                        oddNodes = !oddNodes;
                    }
                }
                j = i;
            }
            return oddNodes;
        }
    }, {
        key: 'path',
        value: function path(ctx) {
            (0, _helpers.path)(ctx, this.points);
        }
    }, {
        key: 'cast',
        value: function cast(ctx, origin, bounds) {
            // The current implementation of projection is a bit hacky... do you have a proper solution?
            var distance = (bounds.bottomright.x - bounds.topleft.x + (bounds.bottomright.y - bounds.topleft.y)) / 2;
            this._forEachVisibleEdges(origin, bounds, function (a, b, originToA, originToB, aToB) {
                var t = originToA.inv().dot(aToB) / aToB.length2();
                var m = void 0; // m is the projected point of origin to [a, b]
                if (t < 0) {
                    m = a;
                } else if (t > 1) {
                    m = b;
                } else {
                    m = a.add(aToB.mul(t));
                }
                var originToM = m.sub(origin);
                // normalize to distance
                originToM = originToM.normalize().mul(distance);
                originToA = originToA.normalize().mul(distance);
                originToB = originToB.normalize().mul(distance);
                // project points
                var oam = a.add(originToM);
                var obm = b.add(originToM);
                var ap = a.add(originToA);
                var bp = b.add(originToB);
                ctx.beginPath();
                (0, _helpers.path)(ctx, [a, b, bp, obm, oam, ap]);
                ctx.fill();
            });
        }
    }]);

    return PolygonObject;
}(_opaqueObject2.default);

exports.default = PolygonObject;
module.exports = exports.default;