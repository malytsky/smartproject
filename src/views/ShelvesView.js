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
        // Мы используем getGlobalPosition для надежности в v8
        return shelf.getGlobalPosition();
    }

    getTopShelfGlobalY() {
        if (this.shelves.length === 0) return 0;
        // Первая полка всегда самая верхняя (rowIndex 0)
        const topShelf = this.shelves[0].container;
        // Глобальная позиция = позиция контейнера + локальная позиция полки * масштаб - половина высоты полки * масштаб
        return this.y + topShelf.y * this.scale.y - (175 / 2) * this.scale.y;
    }

    getBottomShelfGlobalY() {
        if (this.shelves.length === 0) return 0;
        // Последняя полка всегда в нижнем ряду
        const bottomShelf = this.shelves[this.shelves.length - 1].container;
        // Глобальная позиция = позиция контейнера + локальная позиция полки * масштаб + половина высоты полки * масштаб
        return this.y + bottomShelf.y * this.scale.y + (175 / 2) * this.scale.y;
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
        const isPortrait = height > width;
        this.position.set(width / 2, height / 2);
        
        let totalContentHeight, totalContentWidth;
        
        if (isPortrait) {
            // Вертикальная раскладка
            totalContentHeight = 1650; 
            totalContentWidth = 900; 
            
            const scaleX = width / totalContentWidth;
            const scaleY = height / totalContentHeight;
            const baseScale = Math.min(scaleX, scaleY, 0.8);
            this.scale.set(baseScale);

            // Сдвигаем на 23px * scale вниз для баланса
            this.y = (height / 2) + (23 * this.scale.y);
        } else {
            // Горизонтальная раскладка
            // Для landscape уменьшаем целевую высоту контента, чтобы все влезло по вертикали
            totalContentHeight = 1550; 
            totalContentWidth = 1200; 
            
            const scaleX = width / totalContentWidth;
            const scaleY = height / totalContentHeight;
            const baseScale = Math.min(scaleX, scaleY, 0.4);
            this.scale.set(baseScale);
            
            // В ландшафте центрируем с небольшим смещением вниз для компенсации CTA/Button
            this.y = (height / 2) + (23 * this.scale.y);
        }
    }
}
