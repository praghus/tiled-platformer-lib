'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vec = require('./vec2');

var _vec2 = _interopRequireDefault(_vec);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OpaqueObject = function () {
    function OpaqueObject() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, OpaqueObject);

        this.diffuse = options.diffuse || 0.8;
    }

    _createClass(OpaqueObject, [{
        key: 'bounds',
        value: function bounds() {
            return {
                topleft: new _vec2.default(),
                bottomright: new _vec2.default()
            };
        }
    }, {
        key: 'contains',
        value: function contains() {
            return false;
        }
    }]);

    return OpaqueObject;
}();

exports.default = OpaqueObject;
module.exports = exports.default;