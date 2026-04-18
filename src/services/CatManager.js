export class CatManager {
    constructor(gameConfig, shelvesView) {
        this.config = gameConfig;
        this.shelvesView = shelvesView;
    }

    distributeCats(onCatClick) {
        const catPool = this._createColorPool();
        this._shuffleArray(catPool);

        const totalShelves = this.shelvesView.shelves.length;
        const emptyIndex = Math.floor(Math.random() * totalShelves);
        
        let poolIndex = 0;
        for (let i = 0; i < totalShelves; i++) {
            if (i === emptyIndex) continue;
            
            const color = catPool[poolIndex++];
            const cat = this.shelvesView.addCatToShelf(i, color);
            if (cat) {
                cat.on('catClick', (clickedCat) => onCatClick(clickedCat));
            }
        }
    }

    restartGame() {
        const catPool = {};
        this.shelvesView.shelves.forEach(shelf => {
            if (shelf.cat) {
                const cat = shelf.cat;
                const color = cat.color;
                if (!catPool[color]) catPool[color] = [];
                catPool[color].push(cat);
                
                this.shelvesView.catsContainer.removeChild(cat);
                shelf.cat = null;
            }
        });
        
        const targetColors = this._createColorPool();
        this._shuffleArray(targetColors);

        const totalShelves = this.shelvesView.shelves.length;
        const emptyIndex = Math.floor(Math.random() * totalShelves);
        
        let colorIndex = 0;
        for (let i = 0; i < totalShelves; i++) {
            if (i === emptyIndex) continue;
            
            const color = targetColors[colorIndex++];
            let cat;
            
            if (catPool[color] && catPool[color].length > 0) {
                cat = catPool[color].pop();
                cat.setState(this.config.catStates.IDLE);
            }
            
            this.shelvesView.addCatToShelf(i, color, cat);
        }

        Object.values(catPool).forEach(list => {
            list.forEach(cat => cat.destroy());
        });
    }

    _createColorPool() {
        const pool = [];
        this.config.catTypes.forEach(catType => {
            for (let i = 0; i < catType.count; i++) {
                pool.push(catType.color);
            }
        });
        return pool;
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
