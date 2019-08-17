'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _layer = require('../layer');

var _layer2 = _interopRequireDefault(_layer);

var _darkMask = require('./dark-mask');

var _darkMask2 = _interopRequireDefault(_darkMask);

var _lighting = require('./lighting');

var _lighting2 = _interopRequireDefault(_lighting);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IlluminatedLayer = function (_Layer) {
    _inherits(IlluminatedLayer, _Layer);

    function IlluminatedLayer(game) {
        _classCallCheck(this, IlluminatedLayer);

        var _this = _possibleConstructorReturn(this, (IlluminatedLayer.__proto__ || Object.getPrototypeOf(IlluminatedLayer)).call(this, game));

        _this.game = game;
        return _this;
    }

    _createClass(IlluminatedLayer, [{
        key: 'draw',
        value: function draw() {
            var _game = this.game,
                ctx = _game.ctx,
                _game$scene = _game.scene,
                dynamicLights = _game$scene.dynamicLights,
                lights = _game$scene.lights,
                lightmask = _game$scene.lightmask,
                resolutionX = _game$scene.resolutionX,
                resolutionY = _game$scene.resolutionY;


            if (dynamicLights) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';

                lights.map(function (l) {
                    var lighting = new _lighting2.default({
                        light: l,
                        objects: lightmask
                    });
                    lighting.compute(resolutionX, resolutionY);
                    lighting.render(ctx);
                });

                var darkmask = new _darkMask2.default({ lights: lights });

                ctx.globalCompositeOperation = 'source-over';

                darkmask.compute(resolutionX, resolutionY);
                darkmask.render(ctx);

                ctx.restore();
            }
        }
    }]);

    return IlluminatedLayer;
}(_layer2.default);

exports.default = IlluminatedLayer;
module.exports = exports.default;