import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class ButtonView extends PIXI.Container {
    constructor(texture, config) {
        super();
        this.config = config;
        
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
        
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        
        this.setupStates();
        this.startAnimation();
        this.setupClick();
    }

    setupStates() {
        this.sprite.on('pointerover', () => {
            gsap.to(this.sprite.scale, { x: 1.05, y: 1.05, duration: 0.2 });
        });

        this.sprite.on('pointerout', () => {
            gsap.to(this.sprite.scale, { x: 1, y: 1, duration: 0.2 });
        });

        this.sprite.on('pointerdown', () => {
            gsap.to(this.sprite.scale, { x: 0.9, y: 0.9, duration: 0.1 });
        });

        this.sprite.on('pointerup', () => {
            gsap.to(this.sprite.scale, { x: 1.05, y: 1.05, duration: 0.1 });
        });

        this.sprite.on('pointerupoutside', () => {
            gsap.to(this.sprite.scale, { x: 1, y: 1, duration: 0.2 });
        });
    }

    startAnimation() {
        const animate = () => {
            // Баунс (увеличение и возврат)
            gsap.to(this.sprite.scale, {
                x: 1.1,
                y: 1.1,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
                onComplete: () => {
                    gsap.delayedCall(3, animate);
                }
            });
        };
        
        gsap.delayedCall(3, animate);
    }

    setupClick() {
        this.sprite.on('pointertap', () => {
            window.open('https://google.com', '_blank');
        });
    }

    resize(width, height, shelfBottomGlobalY, shelvesScale) {
        this.x = width / 2;
        this.scale.set(shelvesScale); 

        // Позиционируем ниже нижней границы полок (с учетом масштаба)
        const gap = 30 * this.scale.y;
        this.y = shelfBottomGlobalY + (this.sprite.height * this.scale.y / 2) + gap;
        
        // Ограничение по низу экрана
        const bottomMargin = 10;
        const buttonBottomY = this.y + (this.sprite.height * this.scale.y / 2);
        if (buttonBottomY > height - bottomMargin) {
            this.y = height - bottomMargin - (this.sprite.height * this.scale.y / 2);
        }
    }
}
