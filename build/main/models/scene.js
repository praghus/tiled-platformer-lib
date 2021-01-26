"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const helpers_1 = require("../helpers");
const index_1 = require("../index");
const constants_1 = require("../constants");
class Scene {
    constructor(images, viewport, properties = {}) {
        this.images = images;
        this.viewport = viewport;
        this.properties = properties;
        this.entities = {};
        this.layers = [];
        this.tiles = {};
        this.timeoutsPool = {};
        this.debug = false;
        this.checkTimeout = (name) => this.timeoutsPool[name] ? true : false;
        // @todo: consider move to helpers
        this.createCustomLayer = (Layer, index) => this.addLayer(new Layer(this), index);
        this.createSprite = (id, width, height) => new index_1.Sprite(id, this.images[id], width, height);
        this.setProperty = (name, value) => this.properties[name] = value;
        this.getProperty = (name) => this.properties[name];
        this.getMapProperty = (name) => this.map.properties && this.map.properties[name];
        this.getObjects = (layerId) => this.getLayer(layerId).getObjects();
        this.getObjectById = (id, layerId) => this.getObjects(layerId).find((object) => object.id === id);
        this.getObjectByType = (type, layerId) => this.getObjects(layerId).find((object) => object.type === type);
        this.getObjectsByType = (type, layerId) => this.getObjects(layerId).filter((object) => object.type === type);
        this.getObjectByProperty = (key, value, layerId) => this.getObjects(layerId).find(({ properties }) => properties && properties[key] === value);
        this.getObjectLayers = () => this.layers.filter((layer) => helpers_1.isValidArray(layer.objects));
        this.getLayer = (id) => this.layers.find((layer) => layer.id === id);
        this.getTileset = (tileId) => this.map.tilesets.find(({ firstgid, tilecount }) => tileId + 1 >= firstgid && tileId + 1 <= firstgid + tilecount);
        this.getTile = (x, y, layerId) => this.getTileObject(this.getLayer(layerId).get(x, y));
        this.getTileObject = (gid) => this.tiles[gid] || null;
        this.resize = (viewport) => this.camera && this.camera.resize(viewport);
        this.removeLayer = (index) => { this.layers.splice(index, 1); };
        this.removeTile = (x, y, layerId) => this.getLayer(layerId).clear(x, y);
        this.showLayer = (layerId) => this.getLayer(layerId).toggleVisibility(1);
        this.hideLayer = (layerId) => this.getLayer(layerId).toggleVisibility(0);
        this.camera = new index_1.Camera(viewport);
        this.resize(viewport);
    }
    /**
     * Update handler
     * @param time
     * @param input
     */
    update(delta, input) {
        this.input = input;
        for (const layer of this.layers) {
            layer instanceof index_1.Layer && layer.update(this, delta);
        }
        this.camera.update();
    }
    /**
     * Draw handler
     * @param ctx
     */
    draw(ctx) {
        const { resolutionX, resolutionY, scale } = this.viewport;
        ctx.imageSmoothingEnabled = false;
        ctx.save();
        ctx.scale(scale, scale);
        ctx.clearRect(0, 0, resolutionX, resolutionY);
        for (const layer of this.layers) {
            layer instanceof index_1.Layer && layer.draw(ctx, this);
        }
        if (this.debug) {
            const text = helpers_1.fillText(ctx);
            text('CAMERA', 4, 8, constants_1.COLORS.WHITE);
            text(`x:${Math.floor(this.camera.x)}`, 4, 12);
            text(`y:${Math.floor(this.camera.y)}`, 4, 16);
        }
        ctx.restore();
    }
    /**
     * Add new layer
     * @param layer
     * @param index
     */
    addLayer(layer, index) {
        if (layer instanceof index_1.Layer) {
            Number.isInteger(index)
                ? this.layers.splice(index, 0, layer)
                : this.layers.push(layer);
            return layer;
        }
        else
            throw new Error('Invalid Layer!');
    }
    // @todo: refactor sprite+gid
    addObject(entity, index) {
        entity.sprite = entity.image || entity.gid
            ? entity.gid
                ? this.createTile(entity.gid)
                : this.createSprite(entity.image, entity.width, entity.height)
            : null;
        this.getLayer(entity.layerId).addObject(entity, index);
    }
    createTmxMap(data, entities) {
        this.map = data;
        this.entities = entities;
        this.camera.setBounds(0, 0, data.width * data.tilewidth, data.height * data.tileheight);
        data.layers.map((layerData) => layerData && this.createTmxLayer(layerData));
    }
    createTmxLayer(tmxLayer) {
        this.layers.push(new index_1.Layer(tmxLayer));
        if (tmxLayer.data) {
            tmxLayer.data.forEach((gid) => gid > 0 && this.createTile(gid));
        }
        else if (tmxLayer.objects) {
            tmxLayer.objects.forEach((obj) => this.createObject(obj, tmxLayer.id));
        }
    }
    createTile(id) {
        if (!this.tiles[id]) {
            const tileset = this.getTileset(id);
            const image = this.images[helpers_1.getFilename(tileset.image.source)];
            this.tiles[id] = new index_1.Tile(id, image, tileset);
        }
        return this.tiles[id];
    }
    createObject(obj, layerId) {
        const Model = this.entities[obj.type] || index_1.Entity;
        if (Model) {
            this.addObject(new Model(Object.assign({ layerId }, obj)), layerId);
        }
    }
    onScreen(object) {
        const { camera, viewport: { resolutionX, resolutionY }, map: { tilewidth, tileheight } } = this;
        const { bounds, radius } = object;
        const { x, y, w, h } = bounds;
        if (radius) {
            const cx = object.x + x + w / 2;
            const cy = object.y + y + h / 2;
            return (cx + radius > -camera.x &&
                cy + radius > -camera.y &&
                cx - radius < -camera.x + resolutionX &&
                cy - radius < -camera.y + resolutionY);
        }
        else {
            const cx = object.x + x;
            const cy = object.y + y;
            return (cx + w + tilewidth > -camera.x &&
                cy + h + tileheight > -camera.y &&
                cx - tilewidth < -camera.x + resolutionX &&
                cy - tileheight < -camera.y + resolutionY);
        }
    }
    isSolidArea(x, y, layers) {
        return !!layers.map((layerId) => {
            const tile = this.getTile(x, y, layerId);
            return tile && tile.isSolid();
        }).find((isTrue) => !!isTrue);
    }
    forEachVisibleObject(layerId, fn = helpers_1.noop) {
        for (const obj of this.getLayer(layerId).objects) {
            obj.visible && obj.isActive(this) && fn(obj);
        }
    }
    // @todo: refactor 
    forEachVisibleTile(layerId, fn = helpers_1.noop) {
        const { camera, map: { tilewidth, tileheight }, viewport: { resolutionX, resolutionY } } = this;
        let y = Math.floor(camera.y % tileheight);
        let _y = Math.floor(-camera.y / tileheight);
        while (y < resolutionY) {
            let x = Math.floor(camera.x % tilewidth);
            let _x = Math.floor(-camera.x / tilewidth);
            while (x < resolutionX) {
                const tileId = this.getLayer(layerId).get(_x, _y);
                tileId && fn(this.getTileObject(tileId), x, y);
                x += tilewidth;
                _x++;
            }
            y += tileheight;
            _y++;
        }
    }
    startTimeout(name, duration, fn) {
        if (!this.timeoutsPool[name]) {
            this.timeoutsPool[name] = setTimeout(() => {
                this.stopTimeout(name);
                typeof fn === 'function' && fn();
            }, duration);
        }
    }
    stopTimeout(name) {
        if (this.timeoutsPool[name] !== null) {
            clearTimeout(this.timeoutsPool[name]);
            this.timeoutsPool[name] = null;
        }
    }
}
exports.Scene = Scene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvbW9kZWxzL3NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHdDQUFzRTtBQUV0RSxvQ0FBK0U7QUFDL0UsNENBQXFDO0FBRXJDLE1BQWEsS0FBSztJQVlkLFlBQ1csTUFBb0MsRUFDcEMsUUFBa0IsRUFDbEIsYUFBOEIsRUFBRTtRQUZoQyxXQUFNLEdBQU4sTUFBTSxDQUE4QjtRQUNwQyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQ2xCLGVBQVUsR0FBVixVQUFVLENBQXNCO1FBWnBDLGFBQVEsR0FBb0IsRUFBRSxDQUFBO1FBQzlCLFdBQU0sR0FBWSxFQUFFLENBQUE7UUFDcEIsVUFBSyxHQUFxQixFQUFFLENBQUE7UUFDNUIsaUJBQVksR0FBd0IsRUFBRSxDQUFBO1FBSXRDLFVBQUssR0FBRyxLQUFLLENBQUE7UUE2S2IsaUJBQVksR0FBRyxDQUFDLElBQVksRUFBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7UUFvQnZGLGtDQUFrQztRQUMzQixzQkFBaUIsR0FBRyxDQUFDLEtBQTJCLEVBQUUsS0FBYyxFQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2pILGlCQUFZLEdBQUcsQ0FBQyxFQUFVLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBVSxFQUFFLENBQUMsSUFBSSxjQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3BILGdCQUFXLEdBQUcsQ0FBQyxJQUFZLEVBQUUsS0FBVSxFQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElB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