import { gsap } from 'gsap';

export class CatMovementService {
    constructor(app, shelvesView, config) {
        this.app = app;
        this.shelvesView = shelvesView;
        this.config = config;
    }

    moveCatToEmptyShelf(cat, onComplete) {
        const emptyShelfIndex = this.shelvesView.getEmptyShelfIndex();
        if (emptyShelfIndex === -1) return;

        cat.setState(this.config.catStates.SELECT);

        const currentGlobalPos = cat.getGlobalPosition();
        
        const mat = cat.worldTransform;
        const worldScaleX = Math.sqrt(mat.a * mat.a + mat.b * mat.b);
        const worldScaleY = Math.sqrt(mat.c * mat.c + mat.d * mat.d);
        
        this.app.stage.addChild(cat);
        cat.scale.set(worldScaleX, worldScaleY);
        
        const stagePos = this.app.stage.toLocal(currentGlobalPos);
        cat.x = stagePos.x;
        cat.y = stagePos.y;

        const targetGlobalPos = this.shelvesView.getShelfGlobalPosition(emptyShelfIndex);
        targetGlobalPos.y += 5 * worldScaleY;
        const targetStagePos = this.app.stage.toLocal(targetGlobalPos);

        gsap.to(cat, {
            x: targetStagePos.x,
            y: targetStagePos.y,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                const shelf = this.shelvesView.shelves[emptyShelfIndex].container;
                cat.x = shelf.x;
                cat.y = shelf.y + 5;
                cat.scale.set(this.config.catOnShelfScale);
                this.shelvesView.catsContainer.addChild(cat);

                this.shelvesView.moveCatToShelf(cat, emptyShelfIndex);
                cat.setState(this.config.catStates.IDLE);
                
                if (onComplete) onComplete();
            }
        });
    }
}
