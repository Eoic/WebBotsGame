/**
 * Functions, classes and constants used in the game (i.e. move, rotate, shoot etc.)
 */

const MESSAGE_TYPE = {
    INFO: 1,
    WARNING: 2,
    DANGER: 3
}

class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y
    }

    normalize() {
        return new Vector(this.x / Math.sqrt(this.dot(this)),
            this.y / Math.sqrt(this.dot(this)))
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y)
    }
}

class Player {
    constructor(x, y, rotation) {
        this.x = x;
        this.y = y;
        this.health = CONSTANTS.HP_FULL
        this.energy = CONSTANTS.EN_FULL
        this.rotation = rotation
        this.turretRotation = 0
        this.enemyDistance = -1
        this.bulletPool = []
        this.initBulletPool()
    }

    refreshEnergy() {
        if (this.energy + CONSTANTS.ENERGY_REFRESH_STEP <= CONSTANTS.EN_FULL)
            this.energy += CONSTANTS.ENERGY_REFRESH_STEP
    }

    reset() {
        this.health = CONSTANTS.HP_FULL
        this.energy = CONSTANTS.EN_FULL
    }

    applyDamage(damage) {
        if (this.health - damage > 0)
            this.health -= damage
        else this.health = 0
    }

    rotate(x, y, delta) {
        let destinationDegree = Math.atan2(x, y);
        let direction = (destinationDegree > 0) ? 1 : -1;

        if (Math.abs(this.rotation - destinationDegree) > CONSTANTS.PRECISION) {
            this.rotation += direction * delta
            return false;
        }
        else {
            this.rotation = Math.atan2(x, y)
            return true;
        }
    }

    getPosition() {
        return {
            x: this.x,
            y: this.y
        }
    }

    initBulletPool() {
        for (let i = 0; i < CONSTANTS.BULLET_POOL_SIZE; i++) {
            this.bulletPool.push({
                x: 0,
                y: 0,
                rotation: 0,
                isAlive: false
            })
        }
    }

    updateBulletPositions(delta, onBulletMissCallback) {
        this.bulletPool.filter(bullet => bullet.isAlive == true).forEach(bullet => {
            if (bullet.x > CONSTANTS.MAP_WIDTH + CONSTANTS.VISIBLE_MAP_OFFSET ||
                bullet.x < -CONSTANTS.VISIBLE_MAP_OFFSET || bullet.y < -CONSTANTS.VISIBLE_MAP_OFFSET ||
                bullet.y > CONSTANTS.MAP_HEIGHT + CONSTANTS.VISIBLE_MAP_OFFSET) {
                bullet.isAlive = false

                // Bullet is outside map. Call bullet miss
                if (typeof onBulletMissCallback !== 'undefined')
                    onBulletMissCallback()
            } else {
                bullet.x += delta * Math.cos(bullet.rotation) * CONSTANTS.BULLET_TRAVEL_SPEED
                bullet.y += delta * Math.sin(bullet.rotation) * CONSTANTS.BULLET_TRAVEL_SPEED
            }
        })
    }

    createBullet() {
        for (let i = 0; i < CONSTANTS.BULLET_POOL_SIZE; i++) {
            if (this.bulletPool[i].isAlive == false) {
                this.bulletPool[i] = {
                    x: this.x,
                    y: this.y,
                    rotation: this.rotation + this.turretRotation,
                    isAlive: true
                }

                this.energy -= CONSTANTS.BULLET_COST
                break
            }

            if (i == CONSTANTS.BULLET_POOL_SIZE - 1)
                console.log("Bullet pool is too small")
        }
    }

    rotateTurret(x, y, delta) {
        let destinationDegree = Math.atan2(x, y);
        let direction = (destinationDegree > 0) ? 1 : -1;

        if (Math.abs(this.turretRotation - destinationDegree) > CONSTANTS.PRECISION) {
            this.turretRotation += direction * delta
            return false;
        }
        else {
            this.turretRotation = Math.atan2(x, y)
            return true;
        }
    }

    setEnemyDistance(targetPosition) {
        this.enemyDistance = Math.sqrt(Math.pow(targetPosition.x - this.x, 2) + Math.pow(targetPosition.y - this.y, 2))
        this.enemyVisible = true
    }

    getObjectState() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            energy: this.energy,
            rotation: this.rotation,
            turretRotation: this.turretRotation,
            bulletPool: this.bulletPool,
            enemyDistance: this.enemyDistance,
            enemyVisible: false
        }
    }
}

const CONSTANTS = {

    // Game info
    MAP_WIDTH: 674,
    MAP_HEIGHT: 464,
    MOVEMENT_SPEED: 130,
    P_ONE_START_POS: {
        X: 32,
        Y: 32
    },
    P_TWO_START_POS: {
        X: 642,
        Y: 432
    },
    PLAYER_BOX_SIZE: 28,

    // Player info
    HP_FULL: 100,
    EN_FULL: 100,
    BULLET_COST: 6,
    BULLET_POOL_SIZE: 20,
    BULLET_TRAVEL_SPEED: 350,
    BULLET_DAMAGE: 15,
    PLAYER_HALF_WIDTH: 28,
    PLAYER_HALF_HEIGHT: 21.3,
    FOV: 8, // Approximate half angle size

    // Misc
    ENERGY_REFRESH_STEP: 10,
    PRECISION: 0.1,
    VISIBLE_MAP_OFFSET: 100,
    ROUND_COUNT: 5,
    ROUND_TICKS_LENGTH: 2700    // ~1:30 min
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

    /**
     * Checks if object with coordinates (x; y) is not hitting a wall
     */
    checkMapBounds: (x, y) => {
        return (utilities.checkBoundsLowerX(x) && utilities.checkBoundsLowerY(y) &&
            utilities.checkBoundsUpperX(x) && utilities.checkBoundsUpperY(y))
    },

    /**
     * Checks if player colliding with map border and 
     * calls callback function
     */
    wallCollision: (position, onWallHitCallback) => {
        if (!utilities.checkMapBounds(position.x, position.y)) {
            onWallHitCallback()
        }
    },

    /**
     * Checks if any of fired bullet hit enemy player.
     * If hit was detected, dispose bullet and apply damage
     * @param {Array} playerBulletPool 
     * @param {Object} enemyInstance 
     */
    checkForHits(playerBulletPool, enemyInstance, onBulletHitCallback) {
        playerBulletPool.forEach(bullet => {
            if (bullet.isAlive) {
                if (bullet.x >= enemyInstance.x - CONSTANTS.PLAYER_HALF_WIDTH &&
                    bullet.y >= enemyInstance.y - CONSTANTS.PLAYER_HALF_HEIGHT &&
                    bullet.x <= enemyInstance.x + CONSTANTS.PLAYER_HALF_WIDTH &&
                    bullet.y <= enemyInstance.y + CONSTANTS.PLAYER_HALF_HEIGHT) {
                    bullet.isAlive = false
                    enemyInstance.applyDamage(CONSTANTS.BULLET_DAMAGE)

                    // Pass info event of enemy being hit
                    // Should be wrapped inside try / catch
                    if (typeof onBulletHitCallback !== 'undefined') {
                        // Unsafe call
                        onBulletHitCallback({
                            getHealth: () => enemyInstance.health,
                            getEnergy: () => enemyInstance.energy,
                            getHitPosition: () => ({
                                x: enemyInstance.x,
                                y: enemyInstance.y
                            })
                        })
                    }
                }
            }
        })
    },

    /**
     * Checks if function of given name was called 
     * during current frame
     * @param {Object} callMap Function calls lookup object
     * @param {String} functionKey Function name
     */
    functionCalledThisFrame(callMap, functionKey) {
        if (callMap[functionKey] == true)
            return true

        callMap[functionKey] = true
        return false
    },

    /**
     * Sets all game API function as uncalled before each game update
     * @param {Object} callMap Function calls lookup object
     */
    resetCallMap(callMap) {
        Object.keys(callMap).forEach(key => {
            callMap[key] = false
        })
    },

    /**
     * Checks if player exported function with name of 
     * functionName and returns it
     * @param {Object} apiFunctions 
     * @param {String} functionName 
     */
    getExportedFunction(apiFunctions, functionName) {
        try {
            if (apiFunctions.hasOwnProperty(functionName))
                return apiFunctions[functionName]

            return undefined
        } catch (err) {
            //console.log(err)
        }
    },

    /**
     * Checks if enemy is visible in robot's field of view
     * @param {Object} player 
     * @param {Object} enemy 
     */
    insideFOV(player, enemy) {
        if(!player.scanEnabled)
            return;
        
        let turretDirection = new Vector(Math.cos(player.turretRotation + player.rotation), Math.sin(player.turretRotation + player.rotation))
        let targetPosition = new Vector(enemy.x, enemy.y)
        let turretDirectionNormalized = turretDirection.normalize()
        let turretToTarget = targetPosition.subtract(new Vector(player.x, player.y)).normalize()
        let angleDeg = Math.acos(turretDirectionNormalized.dot(turretToTarget)) * (180 / Math.PI)
        player.scanEnabled = false
        
        // Update target data if it's in robot's FOV range
        if(angleDeg <= CONSTANTS.FOV) {
            player.setEnemyDistance(enemy.getPosition())
        } else {
            // Update target visibility so scanner could return that target is not in range
            player.enemyVisible = false
        }
    }
}


module.exports = {
    CONSTANTS,
    MESSAGE_TYPE,
    Vector,
    Player,
    utilities
}