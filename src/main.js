import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

// Регистрируем плагин Pixi для GSAP
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

async function init() {
    // Создаем приложение PixiJS
    const app = new PIXI.Application();
    
    await app.init({
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundColor: 0x1099bb,
        resizeTo: window
    });

    document.getElementById('app').appendChild(app.canvas);

    // Контейнеры для слоев
    const bgContainer = new PIXI.Container();
    const gameContainer = new PIXI.Container();
    const shelvesContainer = new PIXI.Container();
    app.stage.addChild(bgContainer, gameContainer, shelvesContainer);

    let background, cat;

    function resize() {
        const width = app.screen.width;
        const height = app.screen.height;

        if (background) {
            // Background "Cover" strategy
            const bgAspect = background.texture.width / background.texture.height;
            const screenAspect = width / height;

            if (screenAspect > bgAspect) {
                background.width = width;
                background.height = width / bgAspect;
            } else {
                background.height = height;
                background.width = height * bgAspect;
            }
            background.position.set(width / 2, height / 2);
        }

        if (cat) {
            cat.position.set(width / 2, height / 2 + 500); // Опускаем ниже из-за увеличенных отступов полочек
            // Адаптивный масштаб для котика в зависимости от размера экрана
            const baseScale = Math.min(width, height) / 1000;
            cat.scale.set(baseScale * 0.4);
        }

        if (shelvesContainer) {
            shelvesContainer.position.set(width / 2, height / 2);
            const baseScale = Math.min(width, height) / 1200;
            shelvesContainer.scale.set(baseScale);
        }
    }

    // Слушаем изменение размера
    window.addEventListener('resize', resize);

    // Загружаем атлас и ассеты
    try {
        const sheet = await PIXI.Assets.load('/assets/spritesheet.json');
        
        // Фон
        const backTexture = sheet.textures['back.png'];
        background = new PIXI.Sprite(backTexture);
        background.anchor.set(0.5);
        bgContainer.addChild(background);
        
        // Котик
        const catTexture = sheet.textures['Blue_cat_idle.png'];
        cat = new PIXI.Sprite(catTexture);
        cat.anchor.set(0.5);
        gameContainer.addChild(cat);

        // Полочки
        const shelfConfig = [
            { color: 'white', count: 1 },
            { color: 'yellow', count: 2 },
            { color: 'pink', count: 3 },
            { color: 'blue', count: 4 },
            { color: 'green', count: 5 },
            { color: 'orange', count: 6 }
        ];

        const shelfSpacingX = 150;
        const shelfSpacingY = 195; // 175 (высота) + 20 (расстояние)

        shelfConfig.forEach((row, rowIndex) => {
            for (let i = 0; i < row.count; i++) {
                const shelfTexture = sheet.textures[`shelve_${row.color}.png`];
                const shelf = new PIXI.Sprite(shelfTexture);
                shelf.anchor.set(0.5);
                
                shelf.x = i * shelfSpacingX - (5 * shelfSpacingX) / 2; // Выравниваем по левому краю относительно самого длинного ряда (6 полок, индекс 0-5)
                shelf.y = rowIndex * shelfSpacingY - (shelfConfig.length * shelfSpacingY) / 2 + 70;
                
                shelvesContainer.addChild(shelf);
            }
        });

        // Первичный расчет позиций
        resize();

        // Анимации
        gsap.from(background, {
            alpha: 0,
            duration: 1.5,
            ease: 'power2.out'
        });

        gsap.to(cat, {
            pixi: { y: '-=20' },
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

    } catch (error) {
        console.error('Ошибка загрузки ассетов:', error);
        
        // Если ассеты не найдены, просто выведем текст
        const text = new PIXI.Text({
            text: 'PixiJS + GSAP готов к работе!',
            style: {
                fill: '#ffffff',
                fontSize: 36
            }
        });
        text.anchor.set(0.5);
        text.x = app.screen.width / 2;
        text.y = app.screen.height / 2;
        app.stage.addChild(text);
    }
}

init();
