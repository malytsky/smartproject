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

    resize(width, height, shelfTopGlobalY, shelvesScale) {
        this.x = width / 2;
        this.scale.set(shelvesScale); 

        // Позиционируем на 40 пикселей выше верхней границы полок (с учетом масштаба)
        const gap = 30 * this.scale.y;
        this.y = shelfTopGlobalY - (this.sprite.height * this.scale.y / 2) - gap;
        
        // Ограничение по верху экрана
        const topMargin = 10;
        if (this.y - (this.sprite.height * this.scale.y / 2) < topMargin) {
            this.y = topMargin + (this.sprite.height * this.scale.y / 2);
        }
    }
}
