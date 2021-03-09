"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Camera = void 0;
const sat_1 = require("sat");
class Camera {
    constructor(viewport) {
        this.viewport = viewport;
        const { width, height, scale } = viewport;
        this.resize(viewport);
        this.setFocusPoint(Math.round(width / scale) / 2, Math.round(height / scale) / 2);
        this.center = this.center.bind(this);
        this.getBounds = this.getBounds.bind(this);
        this.moveTo = this.moveTo.bind(this);
        this.resize = this.resize.bind(this);
        this.setBounds = this.setBounds.bind(this);
        this.setFocusPoint = this.setFocusPoint.bind(this);
        this.setFollow = this.setFollow.bind(this);
    }
    resize(viewport) {
        this.viewport = viewport;
    }
    moveTo(x, y) {
        this.x = -x;
        this.y = -y;
    }
    center() {
        this.follow
            ? this.moveTo((this.follow.x + this.follow.width / 2) - this.focusPoint.x, (this.follow.y + this.follow.height / 2) - this.focusPoint.y)
            : this.moveTo(this.viewport.width / 2, this.viewport.height / 2);
    }
    getBounds() {
        if (!this.bounds) {
            const { width, height } = this.viewport;
            this.setBounds(0, 0, width, height);
        }
        return this.bounds;
    }
    setBounds(x, y, w, h) {
        this.bounds = new sat_1.Box(new sat_1.Vector(x, y), w, h);
    }
    setFocusPoint(x, y) {
        this.focusPoint = new sat_1.Vector(x, y);
    }
    setFollow(follow, center = true) {
        this.follow = follow;
        center && this.center();
    }
    update() {
        if (!this.follow)
            return;
        const { follow, focusPoint, viewport: { width, height, scale } } = this;
        const { pos: { x, y }, w, h } = this.getBounds();
        const resolutionX = width / scale;
        const resolutionY = height / scale;
        const moveX = ((follow.x + follow.width / 2) + this.x - focusPoint.x) / (resolutionX / 10);
        const moveY = ((follow.y + follow.height / 2) + this.y - focusPoint.y) / (resolutionY / 10);
        const followMidX = follow.x + follow.width / 2;
        const followMidY = follow.y + follow.height / 2;
        this.x -= Math.round(moveX + follow.force.x);
        this.y -= Math.round(moveY + follow.force.y);
        if (followMidX > x &&
            followMidX < x + w &&
            followMidY > y &&
            followMidY < y + h) {
            if (this.x - resolutionX < -x - w)
                this.x = (-x - w + resolutionX);
            if (this.y - resolutionY < -y - h)
                this.y = (-y - h + resolutionY);
            if (this.x > -x)
                this.x = -x;
            if (this.y > -y)
                this.y = -y;
        }
        else {
            if (this.x - resolutionX < -w)
                this.x = (-w + resolutionX);
            if (this.y - resolutionY < -h)
                this.y = (-h + resolutionY);
            if (this.x > 0)
                this.x = 0;
            if (this.y > 0)
                this.y = 0;
        }
    }
}
exports.Camera = Camera;
//# sourceMappingURL=camera.js.map