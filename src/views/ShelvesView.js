import * as PIXI from 'pixi.js';
import { ShelfCatView } from './ShelfCatView';

export class ShelvesView extends PIXI.Container {
    constructor(assetLoader, config) {
        super();
        this.assetLoader = assetLoader;
        this.config = config;
        this.shelves = [];

        this.shelvesContainer = new PIXI.Container();
        this.addChild(this.shelvesContainer);

        this.catsContainer = new PIXI.Container();
        this.addChild(this.catsContainer);

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
                const posX = i * shelfSpacingX - (5 * shelfSpacingX) / 2;
                const posY = rowIndex * shelfSpacingY - (shelfConfig.length * shelfSpacingY) / 2 + 70;
                
                shelf.x = posX;
                shelf.y = posY;
                
                this.shelvesContainer.addChild(shelf);
                this.shelves.push({
                    container: shelf,
                    cat: null,
                    rowColor: row.color,
                    rowIndex: rowIndex
                });
            }
        });

        this.shelvesContainer.cacheAsTexture(true);
    }

    addCatToShelf(index, catColor, existingCat = null) {
        if (this.shelves[index]) {
            const cat = existingCat || new ShelfCatView(this.assetLoader, catColor, this.config);
            // Позиционируем кота на полке (чуть выше центра полки)
            const shelf = this.shelves[index].container;
            cat.x = shelf.x;
            cat.y = shelf.y + 5;
            this.catsContainer.addChild(cat);
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
        const shelf = this.shelves[index].container;
        return this.toGlobal(new PIXI.Point(shelf.x, shelf.y + 5));
    }

    getTopShelfGlobalY() {
        if (this.shelves.length === 0) return 0;
        // Первая полка всегда самая верхняя (rowIndex 0)
        const topShelf = this.shelves[0].container;
        const globalPos = topShelf.getGlobalPosition();
        // Высота полки 175, anchor 0.5, значит верхняя граница на -87.5px локально
        return globalPos.y - (175 / 2) * this.scale.y;
    }

    getBottomShelfGlobalY() {
        if (this.shelves.length === 0) return 0;
        // Последняя полка всегда в нижнем ряду
        const bottomShelf = this.shelves[this.shelves.length - 1].container;
        const globalPos = bottomShelf.getGlobalPosition();
        // Высота полки 175, anchor 0.5, значит нижняя граница на +87.5px локально
        return globalPos.y + (175 / 2) * this.scale.y;
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
        
        // Высота всей композиции (CTA + Gaps + Shelves + Button):
        // CTA: 144
        // Gap: 40
        // Shelves: rowIndex from 0 to 5, total height = (5 * 210) + shelfHeight(175) = 1225
        // Gap: 40
        // Button: 189
        // Итого: 144 + 40 + 1225 + 40 + 189 = 1638
        
        const totalContentHeight = 1650; 
        const totalContentWidth = 900; // 6 * 150
        
        const scaleX = width / totalContentWidth;
        const scaleY = height / totalContentHeight;
        
        const baseScale = Math.min(scaleX, scaleY, 1);
        this.scale.set(baseScale);

        // Центрируем всю композицию в ShelvesView.y
        // Чтобы все было сбалансировано, сдвинем ShelvesView.y чуть вниз,
        // так как сверху CTA (144), а снизу Button (189). 
        // Разница (189 - 144) / 2 = 22.5. Сдвинем на 23px * scale вниз.
        this.y = (height / 2) + (23 * this.scale.y);
    }
}
