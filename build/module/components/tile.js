import { TILE_TYPE } from '../enums';
import { testPolygonPolygon, Box, Polygon, Response, Vector } from 'sat';
import { getPerformance, getProperties, getTileProperties, isValidArray, normalize } from '../helpers';
export class Tile {
    constructor(id, image, tileset) {
        this.id = id;
        this.image = image;
        this.tileset = tileset;
        this.animFrame = 0;
        this.then = getPerformance();
        this.frameStart = getPerformance();
        this.flipV = false;
        this.flipH = false;
        this.isCutomShape = () => getProperties(this, 'objects');
        this.isSlope = () => this.type === TILE_TYPE.SLOPE;
        this.isSolid = () => this.type !== TILE_TYPE.NON_COLLIDING;
        this.isOneWay = () => this.type === TILE_TYPE.ONE_WAY;
        this.isInvisible = () => this.type === TILE_TYPE.INVISIBLE;
        this.properties = getTileProperties(id, this.tileset);
        this.type = this.properties && this.properties.type || null;
        this.width = this.tileset.tilewidth;
        this.height = this.tileset.tileheight;
        this.terrain = this.getTerrain();
        this.collisionMasks = this.getCollisionMask();
    }
    overlapTest(polygon) {
        const response = new Response();
        const hasCollision = this.collisionMasks.some((shape) => testPolygonPolygon(shape, polygon, response));
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
        return new Vector(x, y);
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
            this.frameStart = getPerformance();
            const { frames } = this.properties.animation;
            if (this.frameStart - this.then > frames[this.animFrame].duration) {
                if (this.animFrame <= frames.length) {
                    this.animFrame = normalize(this.animFrame + 1, 0, frames.length);
                }
                this.then = getPerformance();
            }
            return frames[this.animFrame].tileid + firstgid;
        }
        else
            return this.id;
    }
    getCollisionMask(posX = 0, posY = 0) {
        const objects = getProperties(this, 'objects');
        return isValidArray(objects)
            ? objects.map(({ shape, x, y, width, height, points }) => shape === 'polygon'
                ? new Polygon(new Vector(posX, posY), points.map(([x1, y1]) => new Vector(x + x1, y + y1)))
                : new Box(new Vector(posX + x, posY + y), width, height).toPolygon())
            : [new Box(new Vector(posX, posY), this.width, this.height).toPolygon()];
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
//# sourceMappingURL=tile.js.map