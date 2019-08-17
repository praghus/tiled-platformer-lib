'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vec = require('./vec2');

var _vec2 = _interopRequireDefault(_vec);

var _polygonObject = require('./polygon-object');

var _polygonObject2 = _interopRequireDefault(_polygonObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RectangleObject = function (_PolygonObject) {
    _inherits(RectangleObject, _PolygonObject);

    function RectangleObject() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, RectangleObject);

        var _this = _possibleConstructorReturn(this, (RectangleObject.__proto__ || Object.getPrototypeOf(RectangleObject)).call(this, options));

        _this.topleft = options.topleft || new _vec2.default(), _this.bottomright = options.bottomright || new _vec2.default();
        return _this;
    }

    _createClass(RectangleObject, [{
        key: 'syncFromTopleftBottomright',
        value: function syncFromTopleftBottomright() {
            this.points = [this.topleft, new _vec2.default(this.bottomright.x, this.topleft.y), this.bottomright, new _vec2.default(this.topleft.x, this.bottomright.y)];
        }
    }, {
        key: 'fill',
        value: function fill(ctx) {
            var x = this.points[0].x,
                y = this.points[0].y;
            ctx.rect(x, y, this.points[2].x - x, this.points[2].y - y);
        }
    }]);

    return RectangleObject;
}(_polygonObject2.default);

exports.default = RectangleObject;
module.exports = exports.default;