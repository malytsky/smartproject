import * as PIXI from 'pixi.js';

export class BackgroundView extends PIXI.Sprite {
    constructor(texture) {
        super(texture);
        this.anchor.set(0.5);
    }

    resize(width, height) {
        const bgAspect = this.texture.width / this.texture.height;
        const screenAspect = width / height;

        if (screenAspect > bgAspect) {
            this.width = width;
            this.height = width / bgAspect;
        } else {
            this.height = height;
            this.width = height * bgAspect;
        }
        this.position.set(width / 2, height / 2);
    }
}
