import * as PIXI from 'pixi.js';

export class BackgroundView extends PIXI.Sprite {
    constructor(texture) {
        super(texture);
        this.anchor.set(0.5);
    }

    resize(width, height) {
        const scaleX = width / this.texture.width;
        const scaleY = height / this.texture.height;
        const scale = Math.max(scaleX, scaleY);
        
        this.scale.set(scale);
        this.position.set(width / 2, height / 2);
    }
}
