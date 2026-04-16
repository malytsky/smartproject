import * as PIXI from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameConfig } from '../models/GameConfig';
import { BackgroundView } from '../views/BackgroundView';
import { ShelvesView } from '../views/ShelvesView';
import { CallToActionView } from '../views/CallToActionView';
import { ButtonView } from '../views/ButtonView';
import { WinModalView } from '../views/WinModalView';
import { gsap } from 'gsap';

export class GameController {
    constructor() {
        this.app = new PIXI.Application();
        this.assetLoader = new AssetLoader();
        
        this.background = null;
        this.shelves = null;
        this.cta = null;
        this.button = null;
        this.winModal = null;
        this.isMoving = false;
        this.isGameEnded = false;
    }

    async init() {
        await this.app.init({
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: GameConfig.backgroundColor,
            resizeTo: window
        });

        document.getElementById('app').appendChild(this.app.canvas);

        await this.assetLoader.load(GameConfig.assetsPath);
        this.setupViews();
        this.setupListeners();
        this.onResize();
        this.startIntro();
    }

    setupViews() {
        const bgTexture = this.assetLoader.getTexture('back.png');
        this.background = new BackgroundView(bgTexture);
        this.background.cullable = true;
        
        this.shelves = new ShelvesView(this.assetLoader, GameConfig);

        const ctaTexture = this.assetLoader.getTexture('Call to action.png');
        this.cta = new CallToActionView(ctaTexture, GameConfig);
        this.cta.cullable = true;
        this.cta.scale.set(0.5);

        const buttonTexture = this.assetLoader.getTexture('Button.png');
        this.button = new ButtonView(buttonTexture, GameConfig);
        this.button.cullable = true;
        this.button.scale.set(0.5);

        this.winModal = new WinModalView(this.assetLoader);

        this.app.stage.addChild(this.background);
        this.app.stage.addChild(this.shelves);
        this.app.stage.addChild(this.cta);
        this.app.stage.addChild(this.button);
        this.app.stage.addChild(this.winModal);

        this.distributeCats();
    }

    distributeCats() {
        const catPool = [];
        GameConfig.catTypes.forEach(catType => {
            for (let i = 0; i < catType.count; i++) {
                catPool.push(catType.color);
            }
        });

        // Перемешиваем котов
        for (let i = catPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [catPool[i], catPool[j]] = [catPool[j], catPool[i]];
        }

        // Выбираем случайную пустую полку
        const totalShelves = this.shelves.shelves.length;
        const emptyIndex = Math.floor(Math.random() * totalShelves);
        
        let poolIndex = 0;
        // Расставляем по полкам
        for (let i = 0; i < totalShelves; i++) {
            if (i === emptyIndex) continue;
            
            const color = catPool[poolIndex++];
            const cat = this.shelves.addCatToShelf(i, color);
            if (cat) {
                cat.on('catClick', (clickedCat) => this.onCatClick(clickedCat));
            }
        }

        // Начальная проверка на заполнение рядов
        this.checkRowsCompletion();
    }

    onCatClick(cat) {
        if (this.isMoving || this.isGameEnded) return;

        const emptyShelfIndex = this.shelves.getEmptyShelfIndex();
        if (emptyShelfIndex === -1) return;

        this.isMoving = true;
        
        // Стейт select
        cat.setState(GameConfig.catStates.SELECT);

        // Чтобы кот был на переднем плане, временно переносим его в stage
        const currentGlobalPos = cat.getGlobalPosition();
        
        // В PIXI v8 масштабирование можно рассчитать из мировых матриц
        const mat = cat.worldTransform;
        const worldScaleX = Math.sqrt(mat.a * mat.a + mat.b * mat.b);
        const worldScaleY = Math.sqrt(mat.c * mat.c + mat.d * mat.d);
        
        this.app.stage.addChild(cat);
        cat.scale.set(worldScaleX, worldScaleY);
        
        const stagePos = this.app.stage.toLocal(currentGlobalPos);
        cat.x = stagePos.x;
        cat.y = stagePos.y;

        // Получаем глобальные координаты полки назначения
        const targetGlobalPos = this.shelves.getShelfGlobalPosition(emptyShelfIndex);
        // Коты на полке имеют небольшое смещение по Y (shelf.y + 5)
        targetGlobalPos.y += 5 * worldScaleY;
        const targetStagePos = this.app.stage.toLocal(targetGlobalPos);

        gsap.to(cat, {
            x: targetStagePos.x,
            y: targetStagePos.y,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                // Возвращаем кота в catsContainer в ShelvesView
                const shelf = this.shelves.shelves[emptyShelfIndex].container;
                cat.x = shelf.x;
                cat.y = shelf.y + 5;
                cat.scale.set(GameConfig.catOnShelfScale);
                this.shelves.catsContainer.addChild(cat);

                // Обновляем логику в ShelvesView
                this.shelves.moveCatToShelf(cat, emptyShelfIndex);

                // Стейт idle
                cat.setState(GameConfig.catStates.IDLE);
                
                // Проверка на заполнение ряда
                this.checkRowsCompletion();
                
                this.isMoving = false;
            }
        });
    }

    checkRowsCompletion() {
        const rows = this.shelves.getRows();
        let completedRowsCount = 0;
        
        rows.forEach(row => {
            const isOrangeRow = row.color === 'orange';
            const totalShelvesInRow = row.shelves.length;
            const catsInRow = row.shelves.filter(s => s.cat !== null).map(s => s.cat);
            
            let isComplete = false;
            
            if (isOrangeRow) {
                // Исключение для оранжевых: котов на 1 меньше чем полок
                // Но все имеющиеся коты должны быть оранжевыми
                const orangeCats = catsInRow.filter(cat => cat.color === 'orange');
                if (catsInRow.length === totalShelvesInRow - 1 && orangeCats.length === catsInRow.length) {
                    isComplete = true;
                }
            } else {
                // Для остальных: все полки заняты котами соответствующего цвета
                const matchingColorCats = catsInRow.filter(cat => cat.color === row.color);
                if (catsInRow.length === totalShelvesInRow && matchingColorCats.length === totalShelvesInRow) {
                    isComplete = true;
                }
            }

            if (isComplete) {
                completedRowsCount++;
                catsInRow.forEach(cat => {
                    cat.setState(GameConfig.catStates.SLEEP);
                });
            }
        });

        // Если все ряды заполнены правильно
        if (completedRowsCount === rows.length && !this.isGameEnded) {
            this.endGame();
        }
    }

    endGame() {
        this.isGameEnded = true;
        this.winModal.show();
    }

    restartGame() {
        this.isGameEnded = false;
        this.winModal.hide();
        
        // Собираем всех котов в пул для переиспользования
        const catPool = {}; // Группируем по цветам
        this.shelves.shelves.forEach(shelf => {
            if (shelf.cat) {
                const cat = shelf.cat;
                const color = cat.color;
                if (!catPool[color]) catPool[color] = [];
                catPool[color].push(cat);
                
                this.shelves.catsContainer.removeChild(cat);
                shelf.cat = null;
            }
        });
        
        // Новое распределение
        const targetColors = [];
        GameConfig.catTypes.forEach(catType => {
            for (let i = 0; i < catType.count; i++) {
                targetColors.push(catType.color);
            }
        });

        // Перемешиваем цвета
        for (let i = targetColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [targetColors[i], targetColors[j]] = [targetColors[j], targetColors[i]];
        }

        // Выбираем случайную пустую полку
        const totalShelves = this.shelves.shelves.length;
        const emptyIndex = Math.floor(Math.random() * totalShelves);
        
        let colorIndex = 0;
        for (let i = 0; i < totalShelves; i++) {
            if (i === emptyIndex) continue;
            
            const color = targetColors[colorIndex++];
            let cat;
            
            // Пытаемся взять кота нужного цвета из пула
            if (catPool[color] && catPool[color].length > 0) {
                cat = catPool[color].pop();
                cat.setState(GameConfig.catStates.IDLE);
            }
            
            this.shelves.addCatToShelf(i, color, cat);
        }

        // Уничтожаем оставшихся (если вдруг состав поменялся, хотя тут он фиксирован)
        Object.values(catPool).forEach(list => {
            list.forEach(cat => cat.destroy());
        });
        
        this.checkRowsCompletion();
        this.onResize();
    }

    setupListeners() {
        window.addEventListener('resize', () => {
            // Небольшая задержка, чтобы PIXI и браузер успели обновить размеры
            requestAnimationFrame(() => this.onResize());
        });
        this.winModal.on('restart', () => this.restartGame());
    }

    onResize() {
        // Используем актуальные размеры из renderer.screen
        const { width, height } = this.app.renderer.screen;
        
        if (this.background) this.background.resize(width, height);
        
        this.shelves.resize(width, height);
        
        const shelfTopY = this.shelves.getTopShelfGlobalY();
        const shelfBottomY = this.shelves.getBottomShelfGlobalY();
        
        if (this.cta) {
            this.cta.resize(width, height, shelfTopY, this.shelves.scale.x);
        }
        if (this.button) {
            this.button.resize(width, height, shelfBottomY, this.shelves.scale.x);
        }
        if (this.winModal) {
            this.winModal.resize(width, height);
        }
    }

    startIntro() {
        /*if (this.background) {
            gsap.from(this.background, {
                alpha: 0,
                duration: 1.5,
                ease: 'power2.out'
            });
        }*/
    }
}
