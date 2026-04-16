import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { GameController } from './controllers/GameController';

// Регистрируем плагин Pixi для GSAP
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const game = new GameController();
game.init();
