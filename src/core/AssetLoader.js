import * as PIXI from 'pixi.js';

export class AssetLoader {
    constructor() {
        this.sheet = null;
    }

    async load(path) {
        try {
            this.sheet = await PIXI.Assets.load(path);
            this.textures = this.sheet.textures;
            return this.sheet;
        } catch (error) {
            console.error('Ошибка загрузки ассетов:', error);
            throw error;
        }
    }

    getTexture(name) {
        if (this.textures && this.textures[name]) return this.textures[name];
        console.warn(`Texture ${name} not found in atlas`);
        return PIXI.Texture.WHITE;
    }

    hasTexture(name) {
        return !!(this.textures && this.textures[name]);
    }
}
