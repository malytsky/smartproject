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
                this.shelves.push({
                    container: shelfContainer,
                    cat: null,
                    rowColor: row.color,
                    rowIndex: rowIndex
                });
            }
        });
    }

    addCatToShelf(index, catColor) {
        if (this.shelves[index]) {
            const cat = new ShelfCatView(this.assetLoader, catColor, this.config);
            // Позиционируем кота на полке (чуть выше центра полки)
            cat.y = 5;
            this.shelves[index].container.addChild(cat);
            this.shelves[index].cat = cat;
            return cat;
        }
        return null;
    }

    getEmptyShelfIndex() {
        return this.shelves.findIndex(s => s.cat === null);
    }

    getShelfGlobalPosition(index) {
        if (!this.shelves[index]) return null;
        return this.shelves[index].container.toGlobal(new PIXI.Point(0, 5));
    }

    moveCatToShelf(cat, targetShelfIndex) {
        const currentShelfIndex = this.shelves.findIndex(s => s.cat === cat);
        if (currentShelfIndex !== -1) {
            this.shelves[currentShelfIndex].cat = null;
        }
        this.shelves[targetShelfIndex].cat = cat;
    }

    getRows() {
        const rows = [];
        this.shelves.forEach(shelf => {
            if (!rows[shelf.rowIndex]) {
                rows[shelf.rowIndex] = {
                    color: shelf.rowColor,
                    shelves: []
                };
            }
            rows[shelf.rowIndex].shelves.push(shelf);
        });
        return rows;
    }

    resize(width, height) {
        this.position.set(width / 2, height / 2);
        const baseScale = Math.min(width, height) / (this.config.shelvesBaseScale || 1200);
        this.scale.set(baseScale);
    }
}
