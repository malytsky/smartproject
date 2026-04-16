import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class WinModalView extends PIXI.Container {
    constructor(assetLoader) {
        super();
        this.assetLoader = assetLoader;
        
        // Создаем оверлей (фон)
        const overlayTexture = this.assetLoader.getTexture('overlay.png');
        this.overlay = new PIXI.Sprite(overlayTexture);
        this.overlay.anchor.set(0.5);
        this.overlay.alpha = 0.8; // Немного прозрачности для фона
        this.addChild(this.overlay);
        
        // Создаем изображение "like"
        const likeTexture = this.assetLoader.getTexture('like.png');
        this.like = new PIXI.Sprite(likeTexture);
        this.like.anchor.set(0.5);
        this.addChild(this.like);
        
        // Делаем модалку интерактивной
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => this.emit('restart'));
        
        this.visible = false;
        this.bounceTween = null;
    }

    show() {
        this.visible = true;
        this.alpha = 0;
        
        // Простая анимация появления
        gsap.to(this, { alpha: 1, duration: 0.5 });
        gsap.from(this.like.scale, { 
            x: 0, 
            y: 0, 
            duration: 0.5, 
            ease: 'back.out(1.7)',
            onComplete: () => this.startLikeAnimation()
        });
    }

    startLikeAnimation() {
        if (this.bounceTween) this.bounceTween.kill();

        this.bounceTween = gsap.to(this.like.scale, {
            x: '+=0.1',
            y: '+=0.1',
            duration: 0.6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
        });
    }

    hide() {
        this.visible = false;
        if (this.bounceTween) {
            this.bounceTween.kill();
            this.bounceTween = null;
        }
    }

    resize(width, height) {
        this.position.set(width / 2, height / 2);
        
        // Масштабируем оверлей, чтобы он закрывал весь экран
        const scaleX = width / this.overlay.texture.width;
        const scaleY = height / this.overlay.texture.height;
        this.overlay.scale.set(Math.max(scaleX, scaleY));
        
        // Масштабируем "like", чтобы он не был слишком огромным
        const likeScale = Math.min(width, height) / 1000;
        this.like.scale.set(likeScale);
    }
}
