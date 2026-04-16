import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class CallToActionView extends PIXI.Container {
    constructor(texture, config) {
        super();
        this.config = config;
        
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
        
        this.startBounceAnimation();
    }

    startBounceAnimation() {
        const bounce = () => {
            gsap.to(this.sprite.scale, {
                x: 1.1,
                y: 1.1,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
                onComplete: () => {
                    // Ждем 5 секунд перед следующим баунсом
                    gsap.delayedCall(5, bounce);
                }
            });
        };
        
        // Первый запуск через 5 секунд
        gsap.delayedCall(5, bounce);
    }

    resize(width, height, shelfTopGlobalY) {
        // Позиционируем по центру по горизонтали
        this.x = width / 2;
        
        // Масштабирование
        const baseScale = Math.min(width, height) / (this.config.shelvesBaseScale || 1200);
        this.scale.set(baseScale);

        // Позиционируем на 20 пикселей выше верхней полки
        // shelfTopGlobalY - это координата Y верхней точки верхней полки в глобальных координатах
        this.y = shelfTopGlobalY - (this.sprite.height * this.scale.y / 2) - 60;
    }
}
