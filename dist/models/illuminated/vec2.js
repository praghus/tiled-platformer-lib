'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//extend sat.js vector
var Vec2 = function () {
    function Vec2() {
        var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        _classCallCheck(this, Vec2);

        this.x = x;
        this.y = y;
    }

    _createClass(Vec2, [{
        key: 'copy',
        value: function copy() {
            return new Vec2(this.x, this.y);
        }
    }, {
        key: 'dot',
        value: function dot(v) {
            return v.x * this.x + v.y * this.y;
        }
    }, {
        key: 'sub',
        value: function sub(v) {
            return new Vec2(this.x - v.x, this.y - v.y);
        }
    }, {
        key: 'add',
        value: function add(v) {
            return new Vec2(this.x + v.x, this.y + v.y);
        }
    }, {
        key: 'mul',
        value: function mul(n) {
            return new Vec2(this.x * n, this.y * n);
        }
    }, {
        key: 'inv',
        value: function inv() {
            return this.mul(-1);
        }
    }, {
        key: 'dist2',
        value: function dist2(v) {
            var dx = this.x - v.x;
            var dy = this.y - v.y;
            return dx * dx + dy * dy;
        }
    }, {
        key: 'normalize',
        value: function normalize() {
            var length = Math.sqrt(this.length2());
            return new Vec2(this.x / length, this.y / length);
        }
    }, {
        key: 'length2',
        value: function length2() {
            return this.x * this.x + this.y * this.y;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.x + ',' + this.y;
        }
    }, {
        key: 'inBound',
        value: function inBound(topleft, bottomright) {
            return topleft.x < this.x && this.x < bottomright.x && topleft.y < this.y && this.y < bottomright.y;
        }
    }]);

    return Vec2;
}();

exports.default = Vec2;
module.exports = exports.default;