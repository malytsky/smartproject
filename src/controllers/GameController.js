import * as PIXI from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameConfig } from '../models/GameConfig';
import { BackgroundView } from '../views/BackgroundView';
import { ShelvesView } from '../views/ShelvesView';
import { CallToActionView } from '../views/CallToActionView';
import { ButtonView } from '../views/ButtonView';
import { WinModalView } from '../views/WinModalView';

import { GameRulesService } from '../services/GameRulesService';

export class GameController {
    constructor() {
        this.app = new PIXI.Application();
        this.assetLoader = new AssetLoader();
        this.gameRules = null;
        
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
        
        // Инициализируем сервисы
        this.gameRules = new GameRulesService(this.app, this.shelves, GameConfig);
        
        this.setupListeners();
        this.onResize();
        
        this.gameRules.initializeCats((cat) => this.onCatClick(cat));
        
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
    }

    onCatClick(cat) {
        if (this.isMoving || this.isGameEnded) return;

        this.isMoving = true;
        
        this.gameRules.handleCatClick(cat, (isWin) => {
            this.isMoving = false;
            if (isWin && !this.isGameEnded) {
                this.endGame();
            }
        });
    }

    endGame() {
        this.isGameEnded = true;
        this.winModal.show();
    }

    restartGame() {
        this.isGameEnded = false;
        this.winModal.hide();
        
        this.gameRules.resetGame();
        
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
