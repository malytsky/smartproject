export const GameConfig = {
    backgroundColor: 0x1099bb,
    shelfConfig: [
        { color: 'white', count: 1 },
        { color: 'yellow', count: 2 },
        { color: 'pink', count: 3 },
        { color: 'blue', count: 4 },
        { color: 'green', count: 5 },
        { color: 'orange', count: 6 }
    ],
    shelfSpacingX: 150,
    shelfSpacingY: 210,
    catOffsetY: 500,
    catOnShelfScale: 0.6,
    shelvesBaseScale: 1200,
    assetsPath: '/assets/spritesheet.json',
    catTypes: [
        { color: 'white', count: 1 },
        { color: 'yellow', count: 2 },
        { color: 'pink', count: 3 },
        { color: 'blue', count: 4 },
        { color: 'green', count: 5 },
        { color: 'orange', count: 6 }
    ],
    catStates: {
        IDLE: 'idle',
        SELECT: 'select',
        SLEEP: 'sleep'
    }
};
