import { WinConditionChecker } from './WinConditionChecker';
import { CatManager } from './CatManager';
import { CatMovementService } from './CatMovementService';

export class GameRulesService {
    constructor(app, shelvesView, config) {
        this.winChecker = new WinConditionChecker(config);
        this.catManager = new CatManager(config, shelvesView);
        this.movementService = new CatMovementService(app, shelvesView, config);
        this.shelvesView = shelvesView;
    }

    initializeCats(onCatClick) {
        this.catManager.distributeCats(onCatClick);
        this.checkWinCondition();
    }

    handleCatClick(cat, onMoveComplete) {
        this.movementService.moveCatToEmptyShelf(cat, () => {
            const isWin = this.checkWinCondition();
            if (onMoveComplete) onMoveComplete(isWin);
        });
    }

    checkWinCondition() {
        const rows = this.shelvesView.getRows();
        return this.winChecker.check(rows);
    }

    resetGame() {
        this.catManager.restartGame();
        this.checkWinCondition();
    }
}
