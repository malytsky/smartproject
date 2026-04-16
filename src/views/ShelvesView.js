import * as PIXI from 'pixi.js';

export class ShelvesView extends PIXI.Container {
    constructor(assetLoader, config) {
        super();
        this.assetLoader = assetLoader;
        this.config = config;
        this.createShelves();
    }

    createShelves() {
        const { shelfConfig, shelfSpacingX, shelfSpacingY } = this.config;
        
        shelfConfig.forEach((row, rowIndex) => {
            for (let i = 0; i < row.count; i++) {
                const texture = this.assetLoader.getTexture(`shelve_${row.color}.png`);
                const shelf = new PIXI.Sprite(texture);
                shelf.anchor.set(0.5);
                
                // Выравнивание по левому краю относительно самого длинного ряда (6 полок)
                shelf.x = i * shelfSpacingX - (5 * shelfSpacingX) / 2;
                shelf.y = rowIndex * shelfSpacingY - (shelfConfig.length * shelfSpacingY) / 2 + 70;
                
                this.addChild(shelf);
            }
        });
    }

    resize(width, height) {
        this.position.set(width / 2, height / 2);
        const baseScale = Math.min(width, height) / (this.config.shelvesBaseScale || 1200);
        this.scale.set(baseScale);
    }
}
