import * as PIXI from 'pixi.js';

export class AssetLoader {
    constructor() {
        this.sheet = null;
    }

    async load(path) {
        try {
            this.sheet = await PIXI.Assets.load(path);
            return this.sheet;
        } catch (error) {
            console.error('Ошибка загрузки ассетов:', error);
            throw error;
        }
    }

    getTexture(name) {
        return this.sheet.textures[name];
    }
}
