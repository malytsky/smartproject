import * as PIXI from 'pixi.js';

export class ShelfCatView extends PIXI.Container {
    constructor(assetLoader, color, config) {
        super();
        this.assetLoader = assetLoader;
        this.color = color;
        this.config = config;
        this.textureCache = new Map();
        
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5, 0.9); // Привязка к низу, чтобы кот стоял на полке
        this.addChild(this.sprite);

        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        this.sprite.on('pointerdown', () => {
            if (this.currentState === this.config.catStates.SLEEP) return;
            this.emit('catClick', this);
        });
        
        this.setState(this.config.catStates.IDLE);
        this.scale.set(this.config.catOnShelfScale);
    }

    setState(state) {
        if (this.currentState === state && this.sprite.texture && this.sprite.texture !== PIXI.Texture.EMPTY) {
            return;
        }
        
        this.currentState = state;
        let texture = this.textureCache.get(state);
        
        if (!texture) {
            const textureName = this.getTextureName(this.color, state);
            texture = this.assetLoader.getTexture(textureName);
            if (texture) {
                this.textureCache.set(state, texture);
            }
        }

        if (texture) {
            this.sprite.texture = texture;
            
            // Если это стейт select, он обычно в два раза выше idle
            // Нам нужно скорректировать масштаб, чтобы визуально кот не увеличивался
            if (state === this.config.catStates.SELECT) {
                // Высота idle примерно 260, высота select примерно 500
                // Будем использовать коэффициент 0.52 (260/500), чтобы привести к размеру idle
                this.sprite.scale.set(0.52);
            } else {
                this.sprite.scale.set(1);
            }
        }
        
        if (state === this.config.catStates.SLEEP) {
            this.sprite.cursor = 'default';
        } else {
            this.sprite.cursor = 'pointer';
        }
    }

    getTextureName(color, state) {
        // Формат в спрайтшите разный для разных котов, нужно нормализовать
        // Примеры: Blue_cat_idle.png, White_cat_select.png, Green_Cat_sleep.png
        const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Попробуем разные варианты регистра, так как в спрайтшите они вперемешку
        const variants = [
            `${capitalizedColor}_cat_${state}.png`,
            `${capitalizedColor}_Cat_${state}.png`,
            `${capitalizedColor}_cat_${state.charAt(0).toUpperCase() + state.slice(1)}.png`,
            `${capitalizedColor}_Cat_${state.charAt(0).toUpperCase() + state.slice(1)}.png`
        ];

        for (const variant of variants) {
            if (this.assetLoader.hasTexture(variant)) {
                return variant;
            }
        }

        // Fallback (хотя по-хорошему надо точно знать)
        return `${capitalizedColor}_cat_${state}.png`;
    }
}
