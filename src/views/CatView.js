import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class CatView extends PIXI.Sprite {
    constructor(texture, config) {
        super(texture);
        this.config = config;
        this.anchor.set(0.5);
        this.initAnimation();
    }

    initAnimation() {
        gsap.to(this, {
            pixi: { y: '-=20' },
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    resize(width, height) {
        this.position.set(width / 2, height / 2 + (this.config.catOffsetY || 500));
        const baseScale = Math.min(width, height) / 1000;
        this.scale.set(baseScale * (this.config.catBaseScale || 0.4));
    }
}
