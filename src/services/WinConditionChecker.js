export class WinConditionChecker {
    constructor(gameConfig) {
        this.config = gameConfig;
    }

    check(rows) {
        let completedRowsCount = 0;

        rows.forEach(row => {
            const isOrangeRow = row.color === 'orange';
            const totalShelvesInRow = row.shelves.length;
            const catsInRow = row.shelves.filter(s => s.cat !== null).map(s => s.cat);

            let isComplete = false;

            if (isOrangeRow) {
                // Исключение для оранжевых: котов на 1 меньше чем полок
                // Но все имеющиеся коты должны быть оранжевыми
                const orangeCats = catsInRow.filter(cat => cat.color === 'orange');
                if (catsInRow.length === totalShelvesInRow - 1 && orangeCats.length === catsInRow.length) {
                    isComplete = true;
                }
            } else {
                // Для остальных: все полки заняты котами соответствующего цвета
                const matchingColorCats = catsInRow.filter(cat => cat.color === row.color);
                if (catsInRow.length === totalShelvesInRow && matchingColorCats.length === totalShelvesInRow) {
                    isComplete = true;
                }
            }

            if (isComplete) {
                completedRowsCount++;
                catsInRow.forEach(cat => {
                    cat.setState(this.config.catStates.SLEEP);
                });
            }
        });

        return completedRowsCount === rows.length;
    }
}
