"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tile = void 0;
const enums_1 = require("../enums");
const sat_1 = require("sat");
const helpers_1 = require("../helpers");
class Tile {
    constructor(id, image, tileset) {
        this.id = id;
        this.image = image;
        this.tileset = tileset;
        this.animFrame = 0;
        this.then = helpers_1.getPerformance();
        this.frameStart = helpers_1.getPerformance();
        this.flipV = false;
        this.flipH = false;
        this.isCutomShape = () => helpers_1.getProperties(this, 'objects');
        this.isSlope = () => this.type === enums_1.TILE_TYPE.SLOPE;
        this.isSolid = () => this.type !== enums_1.TILE_TYPE.NON_COLLIDING;
        this.isOneWay = () => this.type === enums_1.TILE_TYPE.ONE_WAY;
        this.isInvisible = () => this.type === enums_1.TILE_TYPE.INVISIBLE;
        this.properties = helpers_1.getTileProperties(id, this.tileset);
        this.type = this.properties && this.properties.type || null;
        this.width = this.tileset.tilewidth;
        this.height = this.tileset.tileheight;
        this.terrain = this.getTerrain();
        this.collisionMasks = this.getCollisionMask();
    }
    overlapTest(polygon) {
        const response = new sat_1.Response();
        const hasCollision = this.collisionMasks.some((shape) => sat_1.testPolygonPolygon(shape, polygon, response));
        response.clear();
        return hasCollision && response;
    }
    collide(polygon) {
        const overlap = this.overlapTest(polygon);
        let x, y;
        if (overlap) {
            x = this.isSlope() || this.isOneWay() ? 0 : overlap.overlapV.x;
            y = overlap.overlapV.y;
        }
        return new sat_1.Vector(x, y);
    }
    getBounds(x, y) {
        return {
            x: x * this.width,
            y: y * this.height,
            w: this.width,
            h: this.height
        };
    }
    getTerrain() {
        const { terrain } = this.properties;
        return terrain && terrain.split(',').map((id) => id ? parseInt(id) : null);
    }
    getNextGid() {
        const { tileset: { firstgid } } = this;
        if (this.properties && this.properties.animation) {
            this.frameStart = helpers_1.getPerformance();
            const { frames } = this.properties.animation;
            if (this.frameStart - this.then > frames[this.animFrame].duration) {
                if (this.animFrame <= frames.length) {
                    this.animFrame = helpers_1.normalize(this.animFrame + 1, 0, frames.length);
                }
                this.then = helpers_1.getPerformance();
            }
            return frames[this.animFrame].tileid + firstgid;
        }
        else
            return this.id;
    }
    getCollisionMask(posX = 0, posY = 0) {
        const objects = helpers_1.getProperties(this, 'objects');
        return helpers_1.isValidArray(objects)
            ? objects.map(({ shape, x, y, width, height, points }) => shape === 'polygon'
                ? new sat_1.Polygon(new sat_1.Vector(posX, posY), points.map(([x1, y1]) => new sat_1.Vector(x + x1, y + y1)))
                : new sat_1.Box(new sat_1.Vector(posX + x, posY + y), width, height).toPolygon())
            : [new sat_1.Box(new sat_1.Vector(posX, posY), this.width, this.height).toPolygon()];
    }
    draw(ctx, x, y, scale = 1) {
        if (!this.isInvisible()) {
            const { image, tileset: { columns, firstgid, tilewidth, tileheight } } = this;
            const tileGid = this.getNextGid();
            const posX = ((tileGid - firstgid) % columns) * tilewidth;
            const posY = (Math.ceil(((tileGid - firstgid) + 1) / columns) - 1) * tileheight;
            //y = (tileheight - tile.height)
            ctx.drawImage(image, posX, posY, tilewidth, tileheight, x, y, tilewidth * scale, tileheight * scale);
        }
    }
}
exports.Tile = Tile;
//# sourceMappingURL=tile.js.map