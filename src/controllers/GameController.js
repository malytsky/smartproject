import * as PIXI from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameConfig } from '../models/GameConfig';
import { BackgroundView } from '../views/BackgroundView';
import { ShelvesView } from '../views/ShelvesView';
import { gsap } from 'gsap';

export class GameController {
    constructor() {
        this.app = new PIXI.Application();
        this.assetLoader = new AssetLoader();
        
        this.background = null;
        this.shelves = null;
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

        this.app.stage.addChild(this.background);
        this.app.stage.addChild(this.shelves);

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

        // Расставляем по полкам
        catPool.forEach((color, index) => {
            this.shelves.addCatToShelf(index, color);
        });
    }

    setupListeners() {
        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        const { width, height } = this.app.screen;
        
        if (this.background) this.background.resize(width, height);
        if (this.shelves) this.shelves.resize(width, height);
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
