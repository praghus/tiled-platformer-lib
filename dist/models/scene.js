'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scene = function () {
    function Scene(game) {
        _classCallCheck(this, Scene);

        this.ctx = game.ctx;
        this.assets = game.assets;
        this.viewport = game.viewport;
        this.ticker = game.ticker;
        this.setScene = game.setScene;
        this.playSound = game.playSound;
        this.onKey = game.onKey;
        this.fps = 0;
        this.input = null;
        this.lastInput = null;
        this.delta = null;
        this.lastLoop = null;
        this.timer = null;
        this.frameTime = null;
        this.frameStart = performance.now();
        this.then = performance.now();
        this.countFPS = this.countFPS.bind(this);
        this.countTime = this.countTime.bind(this);
        this.fetchInput = this.fetchInput.bind(this);
        this.checkTimeout = this.checkTimeout.bind(this);
        this.startTimeout = this.startTimeout.bind(this);
        this.stopTimeout = this.stopTimeout.bind(this);
        this.timeoutsPool = {};
        this.loaded = false;
    }

    _createClass(Scene, [{
        key: 'update',
        value: function update(nextProps) {
            if (this.loaded) {
                var config = nextProps.config,
                    assets = nextProps.assets,
                    input = nextProps.input,
                    ticker = nextProps.ticker,
                    viewport = nextProps.viewport;

                this.lastInput = _extends({}, this.input);
                this.assets = assets;
                this.config = config;
                this.ticker = ticker;
                this.viewport = viewport;
                this.input = _extends({}, input.keyPressed);
                this.frameStart = performance.now();
                this.delta = this.frameStart - this.then;

                if (!this.timer) this.timer = (0, _moment2.default)();

                this.onUpdate();

                if (this.delta > this.ticker.interval) {
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
        key: 'draw',
        value: function draw() {
            if (this.loaded) {
                var ctx = this.ctx,
                    viewport = this.viewport;
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
        key: 'render',
        value: function render() {
            // render
        }
    }, {
        key: 'countFPS',
        value: function countFPS() {
            var now = performance.now();
            var currentFrameTime = now - this.lastLoop;
            this.then = this.frameStart - this.delta % this.ticker.interval;
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
        key: 'fetchInput',
        value: function fetchInput(action) {
            return this.input[action] && !this.lastInput[action];
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

    return Scene;
}();

exports.default = Scene;
module.exports = exports.default;