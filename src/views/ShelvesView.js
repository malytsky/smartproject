import * as PIXI from 'pixi.js';
import { ShelfCatView } from './ShelfCatView';

export class ShelvesView extends PIXI.Container {
    constructor(assetLoader, config) {
        super();
        this.assetLoader = assetLoader;
        this.config = config;
        this.shelves = [];
        this.createShelves();
    }

    createShelves() {
        const { shelfConfig, shelfSpacingX, shelfSpacingY } = this.config;
        
        shelfConfig.forEach((row, rowIndex) => {
            for (let i = 0; i < row.count; i++) {
                const shelfContainer = new PIXI.Container();
                
                const texture = this.assetLoader.getTexture(`shelve_${row.color}.png`);
                const shelf = new PIXI.Sprite(texture);
                shelf.anchor.set(0.5);
                shelfContainer.addChild(shelf);
                
                // Выравнивание по левому краю относительно самого длинного ряда (6 полок)
                shelfContainer.x = i * shelfSpacingX - (5 * shelfSpacingX) / 2;
                shelfContainer.y = rowIndex * shelfSpacingY - (shelfConfig.length * shelfSpacingY) / 2 + 70;
                
                this.addChild(shelfContainer);
                this.shelves.push(shelfContainer);
            }
        });
    }

    addCatToShelf(index, catColor) {
        if (this.shelves[index]) {
            const cat = new ShelfCatView(this.assetLoader, catColor, this.config);
            // Позиционируем кота на полке (чуть выше центра полки)
            cat.y = 5;
            this.shelves[index].addChild(cat);
        }
    }

    resize(width, height) {
        this.position.set(width / 2, height / 2);
        const baseScale = Math.min(width, height) / (this.config.shelvesBaseScale || 1200);
        this.scale.set(baseScale);
    }
}
