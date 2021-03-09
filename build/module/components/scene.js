import { getFilename, isValidArray, noop, fillText } from '../helpers';
import { Camera, Entity, Layer, Sprite, Tile } from '../index';
import { COLORS } from '../enums';
export class Scene {
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
        this.createSprite = (id, width, height) => new Sprite(id, this.images[id], width, height);
        this.setProperty = (name, value) => this.properties[name] = value;
        this.getProperty = (name) => this.properties[name];
        this.getMapProperty = (name) => this.map.properties && this.map.properties[name];
        this.getObjects = (layerId) => this.getLayer(layerId).getObjects();
        this.getObjectById = (id, layerId) => this.getObjects(layerId).find((object) => object.id === id);
        this.getObjectByType = (type, layerId) => this.getObjects(layerId).find((object) => object.type === type);
        this.getObjectsByType = (type, layerId) => this.getObjects(layerId).filter((object) => object.type === type);
        this.getObjectByProperty = (key, value, layerId) => this.getObjects(layerId).find(({ properties }) => properties && properties[key] === value);
        this.getObjectLayers = () => this.layers.filter((layer) => isValidArray(layer.objects));
        this.getLayer = (id) => this.layers.find((layer) => layer.id === id);
        this.getTileset = (tileId) => this.map.tilesets.find(({ firstgid, tilecount }) => tileId + 1 >= firstgid && tileId + 1 <= firstgid + tilecount);
        this.getTile = (x, y, layerId) => this.getTileObject(this.getLayer(layerId).get(x, y));
        this.getTileObject = (gid) => this.tiles[gid] || null;
        this.resize = (viewport) => this.camera && this.camera.resize(viewport);
        this.removeLayer = (index) => { this.layers.splice(index, 1); };
        this.removeTile = (x, y, layerId) => this.getLayer(layerId).clear(x, y);
        this.showLayer = (layerId) => this.getLayer(layerId).toggleVisibility(1);
        this.hideLayer = (layerId) => this.getLayer(layerId).toggleVisibility(0);
        this.camera = new Camera(viewport);
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
            layer instanceof Layer && layer.update(this, delta);
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
            layer instanceof Layer && layer.draw(ctx, this);
        }
        if (this.debug) {
            const text = fillText(ctx);
            text('CAMERA', 4, 8, COLORS.WHITE);
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
        if (layer instanceof Layer) {
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
        this.layers.push(new Layer(tmxLayer));
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
            const image = this.images[getFilename(tileset.image.source)];
            this.tiles[id] = new Tile(id, image, tileset);
        }
        return this.tiles[id];
    }
    createObject(obj, layerId) {
        const Model = this.entities[obj.type] || Entity;
        if (Model) {
            this.addObject(new Model({ layerId, ...obj }), layerId);
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
    forEachVisibleObject(layerId, fn = noop) {
        for (const obj of this.getLayer(layerId).objects) {
            obj.visible && obj.isActive(this) && fn(obj);
        }
    }
    // @todo: refactor 
    forEachVisibleTile(layerId, fn = noop) {
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
//# sourceMappingURL=scene.js.map