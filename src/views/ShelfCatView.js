import * as PIXI from 'pixi.js';

export class ShelfCatView extends PIXI.Container {
    constructor(assetLoader, color, config) {
        super();
        this.assetLoader = assetLoader;
        this.color = color;
        this.config = config;
        
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5, 0.9); // Привязка к низу, чтобы кот стоял на полке
        this.addChild(this.sprite);
        
        this.setState(this.config.catStates.IDLE);
        this.scale.set(this.config.catOnShelfScale);
    }

    setState(state) {
        this.currentState = state;
        const textureName = this.getTextureName(this.color, state);
        const texture = this.assetLoader.getTexture(textureName);
        if (texture) {
            this.sprite.texture = texture;
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
            if (this.assetLoader.getTexture(variant)) {
                return variant;
            }
        }

        // Fallback (хотя по-хорошему надо точно знать)
        return `${capitalizedColor}_cat_${state}.png`;
    }
}
