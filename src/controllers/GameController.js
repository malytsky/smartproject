import * as PIXI from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameConfig } from '../models/GameConfig';
import { BackgroundView } from '../views/BackgroundView';
import { ShelvesView } from '../views/ShelvesView';
import { CallToActionView } from '../views/CallToActionView';
import { ButtonView } from '../views/ButtonView';
import { gsap } from 'gsap';

export class GameController {
    constructor() {
        this.app = new PIXI.Application();
        this.assetLoader = new AssetLoader();
        
        this.background = null;
        this.shelves = null;
        this.cta = null;
        this.button = null;
        this.isMoving = false;
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

        try {
            await this.assetLoader.load(GameConfig.assetsPath);
            this.setupViews();
            this.setupListeners();
            this.onResize();
            this.startIntro();
        } catch (error) {
            this.showErrorText();
        }
    }

    setupViews() {
        const bgTexture = this.assetLoader.getTexture('back.png');
        this.background = new BackgroundView(bgTexture);
        
        this.shelves = new ShelvesView(this.assetLoader, GameConfig);

        const ctaTexture = this.assetLoader.getTexture('Call to action.png');
        this.cta = new CallToActionView(ctaTexture, GameConfig);
        this.cta.scale.set(0.5);

        const buttonTexture = this.assetLoader.getTexture('Button.png');
        this.button = new ButtonView(buttonTexture, GameConfig);
        this.button.scale.set(0.5);

        this.app.stage.addChild(this.background);
        this.app.stage.addChild(this.shelves);
        this.app.stage.addChild(this.cta);
        this.app.stage.addChild(this.button);

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
        if (this.isMoving) return;

        const emptyShelfIndex = this.shelves.getEmptyShelfIndex();
        if (emptyShelfIndex === -1) return;

        this.isMoving = true;
        
        // Стейт select
        cat.setState(GameConfig.catStates.SELECT);

        // Чтобы кот был на переднем плане, временно переносим его в stage
        const currentGlobalPos = cat.toGlobal(new PIXI.Point(0, 0));
        this.app.stage.addChild(cat);
        const stagePos = this.app.stage.toLocal(currentGlobalPos);
        cat.x = stagePos.x;
        cat.y = stagePos.y;

        // Получаем глобальные координаты полки назначения
        const targetGlobalPos = this.shelves.getShelfGlobalPosition(emptyShelfIndex);
        const targetStagePos = this.app.stage.toLocal(targetGlobalPos);

        gsap.to(cat, {
            x: targetStagePos.x,
            y: targetStagePos.y,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                // Перемещаем кота в новый контейнер полки
                const targetShelfContainer = this.shelves.shelves[emptyShelfIndex].container;
                
                // Чтобы сохранить визуальную позицию при смене родителя
                cat.x = 0;
                cat.y = 5;
                targetShelfContainer.addChild(cat);

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
                catsInRow.forEach(cat => {
                    cat.setState(GameConfig.catStates.SLEEP);
                });
            }
        });
    }

    setupListeners() {
        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        const { width, height } = this.app.screen;
        
        if (this.background) this.background.resize(width, height);
        if (this.shelves) {
            this.shelves.resize(width, height);
            if (this.cta) {
                const shelfTopY = this.shelves.getTopShelfGlobalY();
                this.cta.resize(width, height, shelfTopY);
            }
            if (this.button) {
                const shelfBottomY = this.shelves.getBottomShelfGlobalY();
                this.button.resize(width, height, shelfBottomY);
            }
        }
    }

    startIntro() {
        if (this.background) {
            gsap.from(this.background, {
                alpha: 0,
                duration: 1.5,
                ease: 'power2.out'
            });
        }
    }

    showErrorText() {
        const text = new PIXI.Text({
            text: 'Ошибка загрузки ассетов!',
            style: {
                fill: '#ffffff',
                fontSize: 36
            }
        });
        text.anchor.set(0.5);
        text.x = this.app.screen.width / 2;
        text.y = this.app.screen.height / 2;
        this.app.stage.addChild(text);
    }
}
