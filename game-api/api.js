/**
 * Functions, classes and constants used in the game (i.e. move, rotate, shoot etc.)
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = CONSTANTS.HP_FULL
        this.energy = CONSTANTS.EN_FULL
        this.rotation = 0,
        this.turretRotation = 0,
        this.bulletPool = []
    }

    refreshEnergy(){
        if(this.energy + CONSTANTS.ENERGY_REFRESH_STEP <= CONSTANTS.EN_FULL)
            this.energy += CONSTANTS.ENERGY_REFRESH_STEP
    }

    reset(){
        this.health = CONSTANTS.HP_FULL
        this.energy = CONSTANTS.EN_FULL
    }

    rotate(x, y, delta) {
        let destinationDegree = Math.atan2(x, y);
        let direction = (destinationDegree > 0) ? 1 : -1; 

        if(Math.abs(this.rotation - destinationDegree) > CONSTANTS.PRECISION){
            this.rotation += direction * delta
            return false;
        }
        else {
            this.rotation = Math.atan2(x, y)
            return true;
        }
    }
}

class Bullet {
    constructor(x, y, rotation){
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
}

const CONSTANTS = {
    // Game info
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
    
    // Player info
    HP_FULL: 100,
    EN_FULL: 100,
    BULLET_COST: 6,

    // Misc
    ENERGY_REFRESH_STEP: 10,
    PRECISION: 0.1
}

const utilities = {
    checkBoundsLowerX: (x) => {
        return (x > CONSTANTS.PLAYER_BOX_SIZE)
    },
    checkBoundsLowerY: (y) => {
        return (y + CONSTANTS.PLAYER_BOX_SIZE < CONSTANTS.MAP_HEIGHT)
    },
    checkBoundsUpperX: (x) => {
        return (x + CONSTANTS.PLAYER_BOX_SIZE < CONSTANTS.MAP_WIDTH)
    },
    checkBoundsUpperY: (y) => {
        return (y > CONSTANTS.PLAYER_BOX_SIZE)
    },
    checkMapBounds: (x, y) => {
        return (utilities.checkBoundsLowerX(x) && utilities.checkBoundsLowerY(y) &&
                utilities.checkBoundsUpperX(x) && utilities.checkBoundsUpperY(y))
    },
    checkForHits(bulletPool, playerPosition){
        // TODO: check for bullets which positions are in player box bounds
        // * Destroy projectile on hit
        // * Calculate total damage done
    }
}

module.exports = {
    CONSTANTS,
    Player,
    Bullet,
    utilities
}