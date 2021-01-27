import { fillText, isValidArray, stroke } from '../helpers';
import { COLORS, NODE_TYPE } from '../constants';
export class Layer {
    constructor(layerData) {
        this.type = NODE_TYPE.CUSTOM;
        this.properties = {};
        this.data = [];
        this.objects = [];
        if (layerData) {
            this.id = layerData.id;
            this.name = layerData.name || '';
            this.type = layerData.type || NODE_TYPE.CUSTOM;
            this.visible = layerData.visible === undefined ? 1 : layerData.visible;
            this.properties = layerData.properties;
            this.width = layerData.width;
            this.height = layerData.height;
            this.data = layerData.data;
        }
    }
    getObjects() {
        return this.objects;
    }
    update(scene, delta) {
        if (isValidArray(this.objects)) {
            for (const obj of this.objects) {
                if (obj.isActive(scene)) {
                    obj.collided = [];
                    this.objects.forEach((activeObj) => activeObj.id !== obj.id && activeObj.overlapTest(obj, scene));
                    obj.update && obj.update(scene, delta);
                    obj.dead && this.removeObject(obj);
                }
            }
        }
    }
    draw(ctx, scene) {
        if (this.visible) {
            switch (this.type) {
                case NODE_TYPE.LAYER:
                    scene.forEachVisibleTile(this.id, (tile, x, y) => {
                        tile.draw(ctx, x, y);
                        if (scene.debug) {
                            tile.collisionMasks.map((cm) => {
                                ctx.lineWidth = 0.1;
                                stroke(ctx)(x, y, cm.points, COLORS.WHITE_30);
                                fillText(ctx)(`${tile.id}`, x + 2, y + 6, COLORS.WHITE_30);
                            });
                        }
                    });
                    break;
                case NODE_TYPE.OBJECT_GROUP:
                    scene.forEachVisibleObject(this.id, (obj) => obj.draw(ctx, scene));
                    break;
            }
            // @todo: handle image layer
        }
    }
    isInRange(x, y) {
        return (x >= 0 &&
            y >= 0 &&
            x < this.width &&
            y < this.height);
    }
    get(x, y) {
        return this.isInRange(x, y) && this.data[x + this.width * y];
    }
    put(x, y, tileId) {
        if (this.isInRange(x, y)) {
            this.data[x + this.width * y] = tileId;
        }
    }
    clear(x, y) {
        if (this.isInRange(x, y)) {
            this.data[x + this.width * y] = null;
        }
    }
    addObject(obj, index = null) {
        index !== null
            ? this.objects.splice(index, 0, obj)
            : this.objects.push(obj);
    }
    removeObject(obj) {
        this.objects.splice(this.objects.indexOf(obj), 1);
    }
    toggleVisibility(toggle) {
        this.visible = toggle;
    }
}
