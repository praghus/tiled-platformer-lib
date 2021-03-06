import { Box, Polygon, Response, Vector, testPolygonPolygon } from 'sat';
import { Light } from 'lucendi';
import { COLORS, NODE_TYPE } from '../enums';
import { boxOverlap, isValidArray, outline, fillText, stroke, lightMaskDisc, lightMaskRect } from '../helpers';
export class Entity {
    constructor(obj) {
        this.force = new Vector(0, 0);
        this.expectedPos = new Vector(0, 0);
        this.collisionLayers = [];
        this.collided = [];
        this.dead = false;
        this.visible = true;
        this.kill = () => this.dead = true;
        this.isActive = (scene) => this.activated || scene.onScreen(this);
        Object.keys(obj).forEach((prop) => this[prop] = obj[prop]);
        this.initialPos = new Vector(this.x, this.y);
        // @todo: refactor
        this.id = obj.id
            ? `${obj.id}`
            : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.setBoundingBox(0, 0, this.width, this.height);
    }
    setBoundingBox(x, y, w, h) {
        this.bounds = { x, y, w, h };
        this.collisionMask = new Box(new Vector(0, 0), w, h).toPolygon().translate(x, y);
    }
    getTranslatedBounds(x = this.x, y = this.y) {
        if (this.collisionMask instanceof Polygon) {
            return Object.assign({}, this.collisionMask, { pos: { x, y } });
        }
    }
    draw(ctx, scene) {
        if (this.isActive(scene) && this.visible) {
            const { camera } = scene;
            if (this.sprite) {
                this.sprite.draw(ctx, this.x + camera.x, this.y + camera.y);
            }
            else if (this.color) {
                ctx.save();
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.rect(this.x + camera.x, this.y + camera.y, this.width, this.height);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            }
            if (scene.debug)
                this._displayDebug(ctx, scene);
        }
    }
    collide(obj, scene, response) {
    }
    hit(damage) {
        if (isValidArray(this.energy)) {
            this.energy[0] -= damage;
        }
    }
    overlapTest(obj, scene) {
        if (this.isActive(scene) && this.collisionMask && obj.collisionMask) {
            const response = new Response();
            if (testPolygonPolygon(this.getTranslatedBounds(), obj.getTranslatedBounds(), response)) {
                this.collide && this.collide(obj, scene, response);
                this.collided.push(obj);
                obj.collide && obj.collide(this, scene, response);
                obj.collided.push(this);
            }
            response.clear();
        }
    }
    update(scene, delta = 0) {
        this.expectedPos = new Vector(this.x + this.force.x, this.y + this.force.y);
        if (!this.force.x && !this.force.y)
            return;
        const { width, height, tilewidth, tileheight } = scene.map;
        const b = this.bounds;
        if (this.expectedPos.x + b.x <= 0 || this.expectedPos.x + b.x + b.w >= width * tilewidth)
            this.force.x = 0;
        if (this.expectedPos.y + b.y <= 0 || this.expectedPos.y + b.y + b.h >= height * tileheight)
            this.force.y = 0;
        const offsetX = this.x + b.x;
        const offsetY = this.y + b.y;
        const PX = Math.ceil((this.expectedPos.x + b.x) / tilewidth) - 1;
        const PY = Math.ceil((this.expectedPos.y + b.y) / tileheight) - 1;
        const PW = Math.ceil((this.expectedPos.x + b.x + b.w) / tilewidth);
        const PH = Math.ceil((this.expectedPos.y + b.y + b.h) / tileheight);
        if (isValidArray(this.collisionLayers) && this.collisionMask) {
            for (const layerId of this.collisionLayers) {
                const layer = scene.getLayer(layerId);
                if (layer.type === NODE_TYPE.LAYER) {
                    for (let y = PY; y < PH; y++) {
                        for (let x = PX; x < PW; x++) {
                            const tile = scene.getTile(x, y, layer.id);
                            const nextX = { x: offsetX + this.force.x, y: offsetY, w: b.w, h: b.h };
                            const nextY = { x: offsetX, y: offsetY + this.force.y, w: b.w, h: b.h };
                            if (tile && tile.isSolid()) {
                                if (tile.isCutomShape() && !(tile.isOneWay() && this.force.y < 0)) {
                                    const overlap = tile.collide(this.getTranslatedBounds(this.x + this.force.x - (x * tilewidth), this.y + this.force.y - (y * tileheight)));
                                    this.force.x += overlap.x;
                                    this.force.y += overlap.y;
                                }
                                else {
                                    const t = tile.getBounds(x, y);
                                    if (boxOverlap(nextX, t) && Math.abs(this.force.x) > 0 && !tile.isOneWay()) {
                                        this.force.x = this.force.x < 0
                                            ? t.x + tile.width - offsetX
                                            : t.x - b.w - offsetX;
                                    }
                                    if (boxOverlap(nextY, t)) {
                                        if (!tile.isOneWay() && Math.abs(this.force.y) > 0) {
                                            this.force.y = this.force.y < 0
                                                ? t.y + tile.height - offsetY
                                                : t.y - b.h - offsetY;
                                        }
                                        else if (this.force.y >= 0 && tile.isOneWay() && this.y + b.y + b.h <= t.y) {
                                            this.force.y = t.y - b.h - offsetY;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.x += this.force.x;
        this.y += this.force.y;
        this.onGround = this.y < this.expectedPos.y;
    }
    addLightSource(color, distance, radius = 8) {
        this.light = new Light({ color, distance, radius, id: this.type });
    }
    getLight(scene) {
        if (!this.light)
            return;
        this.light.move(this.x + (this.width / 2) + scene.camera.x, this.y + (this.height / 2) + scene.camera.y);
        return this.light;
    }
    getLightMask(scene) {
        const x = Math.round(this.x + scene.camera.x);
        const y = Math.round(this.y + scene.camera.y);
        const { pos, points } = this.getTranslatedBounds(x, y);
        return this.shape === 'ellipse'
            ? lightMaskDisc(x, y, this.width / 2)
            : lightMaskRect(pos.x, pos.y, points);
    }
    _displayDebug(ctx, scene) {
        const { camera } = scene;
        const { collisionMask, width, height, type, visible, force } = this;
        const [posX, posY] = [Math.floor(this.x + camera.x), Math.floor(this.y + camera.y)];
        ctx.lineWidth = 0.1;
        outline(ctx)(posX, posY, width, height, visible ? COLORS.WHITE_30 : COLORS.PURPLE);
        ctx.lineWidth = 0.5;
        const color = this.collided.length ? COLORS.LIGHT_RED : COLORS.GREEN;
        stroke(ctx)(posX, posY, collisionMask.points, visible ? color : COLORS.PURPLE);
        const text = fillText(ctx);
        const [x, y] = [posX + width + 4, posY + height / 2];
        text(`${type}`, posX, posY - 10, COLORS.WHITE);
        text(`x:${Math.floor(this.x)}`, posX, posY - 6);
        text(`y:${Math.floor(this.y)}`, posX, posY - 2);
        force.x !== 0 && text(`${force.x.toFixed(2)}`, x, y - 2);
        force.y !== 0 && text(`${force.y.toFixed(2)}`, x, y + 2);
    }
}
//# sourceMappingURL=entity.js.map