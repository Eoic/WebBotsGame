/**
 * Functions, classes and constants used in the game (i.e. move, rotate, shoot etc.)
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = CONSTANTS.HP_FULL
        this.energy = CONSTANTS.EN_FULL
        this.logs = []
    }

    refreshEnergy(){
        if(this.energy + CONSTANTS.ENERGY_REFRESH_STEP <= CONSTANTS.EN_FULL)
            this.energy += CONSTANTS.ENERGY_REFRESH_STEP
    }

    reset(){
        this.health = CONSTANTS.HP_FULL
        this.energy = CONSTANTS.EN_FULL
    }
}

const CONSTANTS = {
    MAP_WIDTH: 674,
    MAP_HEIGHT: 464,
    MOVEMENT_SPEED: 75,
    P_ONE_START_POS: {
        X: 32,
        Y: 32
    },
    P_TWO_START_POS: {
        X: 642,
        Y: 432
    },
    PLAYER_BOX_SIZE: 25,
    HP_FULL: 100,
    EN_FULL: 100,
    ENERGY_REFRESH_STEP: 10
}

module.exports = {
    CONSTANTS,
    Player
}