'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _camera = require('./camera');

var _camera2 = _interopRequireDefault(_camera);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
    function Game(ctx, props) {
        _classCallCheck(this, Game);

        this.ctx = ctx;
        this.props = props;

        this.loaded = false;
        this.fps = 0;
        this.delta = null;
        this.lastLoop = null;
        this.timer = null;
        this.frameTime = null;
        this.timeoutsPool = {};

        this.frameStart = this.getPerformance();
        this.then = this.getPerformance();

        this.countFPS = this.countFPS.bind(this);
        this.countTime = this.countTime.bind(this);
        this.checkTimeout = this.checkTimeout.bind(this);
        this.startTimeout = this.startTimeout.bind(this);
        this.stopTimeout = this.stopTimeout.bind(this);
        this.getPerformance = this.getPerformance.bind(this);

        this.camera = new _camera2.default(this);
    }

    _createClass(Game, [{
        key: 'getPerformance',
        value: function getPerformance() {
            return typeof performance !== 'undefined' && performance.now();
        }
    }, {
        key: 'update',
        value: function update(nextProps) {
            if (this.loaded) {
                this.props = nextProps;
                this.frameStart = this.getPerformance();
                this.delta = this.frameStart - this.then;

                if (!this.timer) this.timer = (0, _moment2.default)();

                this.onUpdate();

                if (this.delta > this.props.ticker.interval) {
                    this.tick();
                    this.countFPS();
                }
            }
        }
    }, {
        key: 'onUpdate',
        value: function onUpdate() {
            // on update
        }
    }, {
        key: 'tick',
        value: function tick() {
            // tick
        }
    }, {
        key: 'render',
        value: function render() {
            // render
        }
    }, {
        key: 'draw',
        value: function draw() {
            if (this.loaded) {
                var ctx = this.ctx,
                    viewport = this.props.viewport;
                var resolutionX = viewport.resolutionX,
                    resolutionY = viewport.resolutionY,
                    scale = viewport.scale;


                ctx.imageSmoothingEnabled = false;
                ctx.save();
                ctx.scale(scale, scale);
                ctx.clearRect(0, 0, resolutionX, resolutionY);
                this.render();
                ctx.restore();
            }
        }
    }, {
        key: 'countFPS',
        value: function countFPS() {
            var now = this.getPerformance();
            var currentFrameTime = now - this.lastLoop;
            this.then = this.frameStart - this.delta % this.props.ticker.interval;
            this.frameTime += (currentFrameTime - this.frameTime) / 100;
            this.fps = 1000 / this.frameTime;
            this.lastLoop = now;
        }
    }, {
        key: 'countTime',
        value: function countTime() {
            var ms = (0, _moment2.default)().diff((0, _moment2.default)(this.timer));
            var d = _moment2.default.duration(ms);
            return d.asHours() >= 1 ? Math.floor(d.asHours()) + _moment2.default.utc(ms).format(':mm:ss') : _moment2.default.utc(ms).format('mm:ss');
        }
    }, {
        key: 'checkTimeout',
        value: function checkTimeout(name) {
            return this.timeoutsPool[name] || null;
        }
    }, {
        key: 'startTimeout',
        value: function startTimeout(name, duration) {
            var _this = this;

            var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _helpers.noop;

            if (!this.timeoutsPool[name]) {
                this.timeoutsPool[name] = setTimeout(function () {
                    _this.stopTimeout(name);
                    callback();
                }, duration);
            }
        }
    }, {
        key: 'stopTimeout',
        value: function stopTimeout(name) {
            if (this.timeoutsPool[name] !== null) {
                clearTimeout(this.timeoutsPool[name]);
                this.timeoutsPool[name] = null;
            }
        }
    }]);

    return Game;
}();

exports.default = Game;
module.exports = exports.default;