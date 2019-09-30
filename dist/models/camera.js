'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sat = require('sat');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Camera = function () {
    function Camera(game) {
        _classCallCheck(this, Camera);

        this.game = game;
        this.x = 0;
        this.y = 0;
        this.bounds = null;
        this.middlePoint = null;
        this.magnitude = 2;
        this.shakeDirection = 1;
        this.speed = 2.5;
        this.shake = this.shake.bind(this);
        this.setBounds = this.setBounds.bind(this);
        this.moveTo = {};

        this.setDefaultMiddlePoint();
    }

    _createClass(Camera, [{
        key: 'setDefaultMiddlePoint',
        value: function setDefaultMiddlePoint() {
            if (this.game.scene) {
                var _game$scene = this.game.scene,
                    resolutionX = _game$scene.resolutionX,
                    resolutionY = _game$scene.resolutionY;


                this.setMiddlePoint(resolutionX / 2, resolutionY / 2);
            } else this.setMiddlePoint(0, 0);
        }
    }, {
        key: 'setMiddlePoint',
        value: function setMiddlePoint(x, y) {
            this.middlePoint = { x: x, y: y };
        }
    }, {
        key: 'setFollow',
        value: function setFollow(follow) {
            var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            this.follow = follow;
            center && this.center();
        }
    }, {
        key: 'setBounds',
        value: function setBounds(x, y, w, h) {
            this.bounds = new _sat.Box(new _sat.Vector(x, y), w, h);
            this.center();
        }
    }, {
        key: 'getBounds',
        value: function getBounds() {
            if (!this.bounds) {
                var _game$scene$map = this.game.scene.map,
                    width = _game$scene$map.width,
                    height = _game$scene$map.height,
                    tilewidth = _game$scene$map.tilewidth,
                    tileheight = _game$scene$map.tileheight;

                this.setBounds(0, 0, width * tilewidth, height * tileheight);
            }
            return this.bounds;
        }
    }, {
        key: 'update',
        value: function update() {
            if (!this.game.scene || !this.follow) {
                return;
            }
            var _game$scene2 = this.game.scene,
                resolutionX = _game$scene2.resolutionX,
                resolutionY = _game$scene2.resolutionY,
                map = _game$scene2.map;
            var width = map.width,
                height = map.height,
                tilewidth = map.tilewidth,
                tileheight = map.tileheight;


            var moveX = Math.round((this.follow.x + this.follow.width / 2 + this.x - this.middlePoint.x) / (resolutionX / 10));

            var moveY = Math.round((this.follow.y + this.follow.height / 2 + this.y - this.middlePoint.y) / (resolutionY / 10));

            if (moveX !== 0) this.x -= moveX;
            if (moveY !== 0) this.y -= moveY;
            if (this.follow.force.x !== 0) this.x -= this.follow.force.x;
            if (this.follow.force.y !== 0) this.y -= this.follow.force.y;

            // bounds

            var _getBounds = this.getBounds(),
                _getBounds$pos = _getBounds.pos,
                x = _getBounds$pos.x,
                y = _getBounds$pos.y,
                w = _getBounds.w,
                h = _getBounds.h;

            var followMidX = this.follow.x + this.follow.width / 2;
            var followMidY = this.follow.y + this.follow.height / 2;

            if (followMidX > x && followMidX < x + w && followMidY > y && followMidY < y + h) {
                if (this.x - resolutionX < -x - w) this.x = -x - w + resolutionX;
                if (this.y - resolutionY < -y - h) this.y = -y - h + resolutionY;
                if (this.x > -x) this.x = -x;
                if (this.y > -y) this.y = -y;
            } else {
                var mw = -width * tilewidth;
                var mh = -height * tileheight;
                if (this.x - resolutionX < mw) this.x = mw + resolutionX;
                if (this.y - resolutionY < mh) this.y = mh + resolutionY;
                if (this.x > 0) this.x = 0;
                if (this.y > 0) this.y = 0;
            }

            // shake
            if (this.magnitude !== 2) {
                if (this.shakeDirection === 1) this.y += this.magnitude;else if (this.shakeDirection === 2) this.x += this.magnitude;else if (this.shakeDirection === 3) this.y -= this.magnitude;else this.x -= this.magnitude;
                this.shakeDirection = this.shakeDirection < 4 ? this.shakeDirection + 1 : 1;
            }
        }
    }, {
        key: 'center',
        value: function center() {
            if (this.follow) {
                this.x = -(this.follow.x + this.follow.width / 2 - this.middlePoint.x);
                this.y = -(this.follow.y + this.follow.height - this.middlePoint.y);
            }
        }
    }, {
        key: 'shake',
        value: function shake() {
            if (this.magnitude < 0) {
                this.magnitude = 2;
                return;
            }
            this.magnitude -= 0.2;
            setTimeout(this.shake, 50);
        }
    }]);

    return Camera;
}();

exports.default = Camera;
module.exports = exports.default;