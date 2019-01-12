/**
 * For running game logic (i.e. game loop(s))
 */

const { NodeVM, VMScript, VM } = require('vm2');
const uuidv4 = require('uuid/v4');
const { Player, GameTracker, CONSTANTS, MESSAGE_TYPE, utilities } = require('./api')
const TICK_RATE = 30
const playerKeys = ['playerOne', 'playerTwo']
const cookie = require('cookie')
const User = require('../models/User')
const GameSession = require('../models/GameSession')
const { RULE_CONDITIONS, AchievementUnlocker, RuleSet } = require('./achievements')

// TODO: 
// + Reset bullet pool on next round start
// + Import User model for statistic updating
// +- Round reset and statistics collection update
// + End round after one of the robots reach 0 HP
// + Enemy scanning API function
// + Identify multiplayer game ending(reached round count)
// + Save isAdmin in session
// + Allow "Manage users" page for admin
// + Add user password reset
// User redis memory storage instead of session for saving temporary multiplayer data
// + Send elapsed game ticks on multiplayer match ending
// Send which one of the players won the game 

// FIX
// + Tracker shots fired counting is wrong
// + Tracker damage done counting is (maybe) wrong
// + Round winner finder doesn't work
// Game winner counter doesnt work
// + Currently wrong order of names in game info panel
// + Wrong order of starting robots in mp
// Reset robot code on each but first round start

const context = {
    delta: 0,
    robot: {},
    messages: []
};

const GAME_TYPE = {
    SIMULATION: 'S',
    MULTIPLAYER: 'M'
}

const nodeVM = new NodeVM({
    wrapper: "commonjs",
    require: {
        external: ['node-neural-network'],
        context: 'sandbox'
        // The only working path... /Users/Karolis/Desktop/web-bots-it/node_modules/node-neural-network
    },
    sandbox: { context }
});

/*
Safer approach to code running in VM

let moduleMethods = nodeVM.run(`
    function update() {
        let a = 10
        return a * a
    }

    module.exports = { update }
`)

const vm = new VM({
    timeout: 1000,
    sandbox: {}
});

let methodToRun = moduleMethods.update.toString()
let result = vm.run(methodToRun + ' update()')
console.log(result)
*/

const time = () => {
    let time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000;
}

let previous = time();
let tickLength = 1000 / TICK_RATE;
let gameStates = {};
let callMap = {
    moveForwardX: false,
    moveForwardY: false,
    moveForward: false,
    moveBackX: false,
    moveBackY: false,
    moveBack: false,
    shoot: false,
    rotate: false,
    rotateTurret: false,
    scan: false
}

// API
// Robot control functions
const player = {

    /**
     * Moves player forwards along by x axis
     */
    moveForwardX: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveForwardX.name))
            return;

        if (utilities.checkBoundsUpperX(context.robot.x))
            context.robot.x += context.delta * CONSTANTS.MOVEMENT_SPEED;
    },

    /**
     * Moves player forwards along y axis
     */
    moveForwardY: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBackY.name))
            return;

        if (context.robot.rotate(-1, 0, context.delta))
            if (utilities.checkBoundsUpperY(context.robot.y))
                context.robot.y -= context.delta * CONSTANTS.MOVEMENT_SPEED
    },

    /**
     * Moves player backwards along x axis
     */
    moveBackX: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBackX.name))
            return

        if (context.robot.rotate(0, -1, context.delta))
            if (utilities.checkBoundsLowerX(context.robot.x))
                context.robot.x -= context.delta * CONSTANTS.MOVEMENT_SPEED;
    },

    /**
     * Moves player backwards along y axis
     */
    moveBackY: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBackY.name))
            return

        if (context.robot.rotate(1, 0, context.delta))
            if (utilities.checkBoundsLowerY(context.robot.y))
                context.robot.y += context.delta * CONSTANTS.MOVEMENT_SPEED
    },

    /**
     * Moves player forwards according to its rotation
     */
    moveForward: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveForward.name))
            return

        if (!utilities.checkMapBounds(context.robot.x, context.robot.y))
            return false

        context.robot.x += context.delta * Math.cos(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED
        context.robot.y += context.delta * Math.sin(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED
        return true
    },

    /**
     * Moves layer backwards according to its rotation
     */
    moveBack: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBack.name))
            return

        if (!utilities.checkMapBounds(context.robot.x, context.robot.y))
            return

        context.robot.x -= context.delta * Math.cos(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED
        context.robot.y -= context.delta * Math.sin(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED
    },

    /**
     * Rotates player clockwise if degrees < 0, 
     * and counter-clockwise if degrees > 0
     */
    rotate: (degrees) => {
        if (utilities.functionCalledThisFrame(callMap, player.rotate.name))
            return

        degrees += 90;
        let radians = degrees * (Math.PI / 180)
        return context.robot.rotate(Math.cos(radians), Math.sin(radians), context.delta)
    },

    /**
     * Rotates player clockwise if degrees < 0, 
     * and counter-clockwise if degrees > 0
     */
    rotateTurret: (degrees) => {
        if (utilities.functionCalledThisFrame(callMap, player.rotateTurret.name))
            return

        degrees += 90
        let radians = degrees * (Math.PI / 180)
        return context.robot.rotateTurret(Math.cos(radians), Math.sin(radians), context.delta)
    },

    /**
     * Shoots bullets by direction of turet rotation
     */
    shoot: () => {
        if (utilities.functionCalledThisFrame(callMap, player.shoot.name))
            return

        if (context.robot.energy >= CONSTANTS.BULLET_COST) {
            context.robot.createBullet()
            return true
        }

        return false
    },

    /**
     * Returns info about player
     */
    getState: () => {
        return context.robot.getObjectState();
    }
}

// For detecting enemy position
const scanner = {
    /**
     * Field of view of limited length from turret rotation
     * If enemy appears inside it, return its data(coordinates, etc)
     */
    pulse: () => {
        context.robot.scanEnabled = true
        return context.robot.enemyVisible
    },

    /**
     * Returns last scanned distance from scanned enemy
     */
    getTargetDistance: () => {
        return context.robot.enemyDistance
    }
}

// For logging messaget so output window
const logger = {
    log: (content, messageType) => {
        context.messages.push({
            content,
            type: (typeof messageType !== 'undefined') ? messageType : MESSAGE_TYPE.INFO
        })
    }
}

nodeVM.freeze(player, 'player');                // Game API calls
nodeVM.freeze(CONSTANTS, 'GAME');               // Constants
nodeVM.freeze(logger, 'logger')                 // Info output
nodeVM.freeze(MESSAGE_TYPE, 'MESSAGE_TYPE')     // Logger message type
nodeVM.freeze(scanner, 'scanner')               // Scanner api for locating enemy robot

/**
 * Updates pair of players and returns their updated state
 * through web socket connection
 * @param {double} delta Time since last frame
 */
function update(delta) {

    // Iterate through connected clients
    for (clientID in gameStates) {
        context.delta = delta

        // Updates multiplayer game info for client
        // If multiplayerGame ended - stop updating
        if (updateMultiplayerInfo(gameStates[clientID]) < 0)
            break;

        // Run code for each robot
        playerKeys.forEach((key, index) => {
            utilities.resetCallMap(callMap)
            context.robot = gameStates[clientID][key]
            context.robot.decrementGunCooldown()

            try {
                gameStates[clientID].code[key].update()
            } catch (err) {
                console.log(err)
            }

            utilities.insideFOV(context.robot, gameStates[clientID][playerKeys[1 ^ index]])
            utilities.wallCollision(context.robot.getPosition(), utilities.getExportedFunction(gameStates[clientID].code[key], 'onWallHit'))
            utilities.checkPlayerCollisions(context.robot.getPosition(), gameStates[clientID][playerKeys[1 ^ index]].getPosition(), utilities.getExportedFunction(gameStates[clientID].code[key], 'onCollision'))
            utilities.checkForHits(gameStates[clientID][playerKeys[1 ^ index]], context.robot, utilities.getExportedFunction(gameStates[clientID].code[key], 'onBulletHit'))
            context.robot.updateBulletPositions(context.delta, utilities.getExportedFunction(gameStates[clientID].code[key], 'onBulletMiss'))
        })

        sendUpdate(gameStates, clientID)    // Send game update after game state were updated
        context.messages = []               // Flush output buffer
    }
}

function sendUpdate(gameStates, clientId) {
    if (gameStates[clientId].socket.readyState === 1) {
        gameStates[clientId].socket.send(JSON.stringify({
            type: 'GAME_TICK_UPDATE',
            playerOne: gameStates[clientId].playerOne.getObjectState(),
            playerTwo: gameStates[clientId].playerTwo.getObjectState(),
            gameSession: (typeof gameStates[clientId].multiplayerData !== 'undefined') ? gameStates[clientId].multiplayerData : null,
            gameType: gameStates[clientId].gameType,
            messages: context.messages
        }))
    }
}

/**
 * Updates info about multiplayer game session
 * @param {Object} gameState 
 */
function updateMultiplayerInfo(gameState) {
    if (typeof gameState.multiplayerData === 'undefined')
        return 0;

    gameState.multiplayerData.elapsedTicks++

    if (gameState.multiplayerData.elapsedTicks >= CONSTANTS.ROUND_TICKS_LENGTH || damagedToZero(gameState)) {
        gameState.multiplayerData.elapsedTotalTime += gameState.multiplayerData.elapsedTicks

        if (gameState.multiplayerData.elapsedRounds === 5) {
            // Game ended
            Reflect.deleteProperty(gameStates, gameState.socket.id)
            endMultiplayerMatch(gameState)
            return -1
        } else
            nextRound(gameState)
    }
}

/**
 * Checks if either of two robots was damaged to 0 HP
 * If true, then call next round without waiting round time
 * @param {Object} gameState 
 */
function damagedToZero(gameState) {
    if (gameState[playerKeys[0]].health === 0 || gameState[playerKeys[1]].health === 0)
        return true
    return false
}

function endMultiplayerMatch(gameState) {

    // Determine who won the last round
    utilities.registerRoundWin(gameState[playerKeys[0]], gameState[playerKeys[1]])
    const winner = utilities.getGameWinner(gameState[playerKeys[0]], gameState[playerKeys[1]])
    let data = []

    playerKeys.forEach(key => {
        data.push({
            name: gameState[key].playerName,
            statistics: gameState[key].tracker.getData()
        })
    })

    /* Remove multiplayer session data after game is finished */
    GameSession.findOneAndRemove({
        'sessionId': gameState.multiplayerData.sessionId
    }).then((sessionData) => {
        gameState.socket.send(JSON.stringify({
            type: 'GAME_END',
            gameData: data,
            totalTime: gameState.multiplayerData.elapsedTotalTime,
            winner
        }))

        updatePlayerStatistics(sessionData, gameState, winner)
    })
}

function updatePlayerStatistics(gameSessionData, gameState, winner) {
    let gameWon = 0

    if (winner === gameSessionData.createdBy)
        gameWon = 1

    User.findOneAndUpdate({
        username: gameSessionData.createdBy
    }, {
            $inc: {
                'statistic.gamesPlayed': 1,
                'statistic.gamesWon': gameWon
            }
        }).then(response => {
            console.log(response)
        })
}

/**
 * Sets next round on multiplayer match
 * @param {Object} gameState Data about robots in the game 
 */
function nextRound(gameState) {
    // Determine who won the round
    utilities.registerRoundWin(gameState[playerKeys[0]], gameState[playerKeys[1]])

    playerKeys.forEach(key => {
        gameState[key].resetVitals()
        gameState[key].resetPosition()
        gameState[key].resetBulletPool()
    })

    gameState.multiplayerData.elapsedRounds++
    gameState.multiplayerData.elapsedTicks = 0
    return 1
}

/**
 * Calls game loop and calculates 
 * time between frames
 */
const loop = () => {
    setTimeout(loop, tickLength);
    let now = time();
    let delta = (now - previous) / 1000;
    update(delta);
    previous = now;
}

/**
 * Runs robot scripts once and
 * returns script methods
 * @param {Array} scripts 
 * @param {Array} keys 
 */
function compileScripts(scripts, keys) {
    let code = {}

    try {
        keys.forEach((key, index) => {
            code[key] = nodeVM.run(scripts[index])
        })
    } catch (err) {
        console.log(err)
    }

    return code
}

/**
 * Creates game objects used in game loop
 * @param {Array} scripts 
 * @param {Array} playerKeys 
 * @param {Object} ws 
 */
function createGameObjects(scripts, playerKeys, ws, gameType, names = ['placeholder', 'placeholder'], sessionId = undefined) {
    let code = compileScripts(scripts, playerKeys)

    gameStates[ws.id] = {
        playerOne: new Player(CONSTANTS.P_ONE_START_POS.X, CONSTANTS.P_ONE_START_POS.Y, 0, new GameTracker(), names[0]),
        playerTwo: new Player(CONSTANTS.P_TWO_START_POS.X, CONSTANTS.P_TWO_START_POS.Y, Math.PI, new GameTracker(), names[1]),
        socket: ws,
        gameType,
        code
    }

    if (gameType === GAME_TYPE.MULTIPLAYER) {
        gameStates[ws.id]['multiplayerData'] = {
            elapsedTicks: 0,
            elapsedRounds: 1,
            elapsedTotalTime: 0,
            sessionId
        }
    }
}

/**
 * Client connection event handler
 * @param { Object } ws Web socket object
 */
const wsServerCallback = (ws, req, store) => {
    const cookieObject = cookie.parse(req.headers.cookie)
    const sessionId = cookieObject['connect_sid'].slice(2, 38)

    store.get(sessionId, (err, sessionData) => {

        // User autenticated
        if (!err) {
            ws.id = uuidv4();

            ws.on('message', (data) => {

                let payload = JSON.parse(data);

                switch (payload.type) {
                    case 'SIMULATION':
                        createGameObjects([payload.playerCode, payload.enemyCode], playerKeys, ws, GAME_TYPE.SIMULATION)
                        break;
                    case 'MULTIPLAYER':
                        if (typeof sessionData.user.multiplayer !== 'undefined') {

                            GameSession.findOne({
                                'sessionId': sessionData.user.multiplayer.sessionId,
                                'createdBy': sessionData.user.username
                            }).then(session => {
                                createGameObjects([session.data[0].code, session.data[1].code],
                                    playerKeys, ws, GAME_TYPE.MULTIPLAYER,
                                    [session.data[0].username, session.data[1].username],
                                    session.sessionId)

                                ws.send(JSON.stringify({
                                    type: 'PLAYER_NAMES',
                                    names: {
                                        playerOne: session.data[0].username,
                                        playerTwo: session.data[1].username
                                    }
                                }))
                            }).catch(err => {
                                console.log(err)
                            })
                        }
                        break;
                    default:
                        return 0;
                }
            });

            // Delete player connection from gameStates array
            ws.on('close', () => {
                if (gameStates[ws.id] !== undefined) {
                    if (gameStates[ws.id].gameType === GAME_TYPE.MULTIPLAYER) {
                        
                        // User left mid-game. 
                        // Remove session data and count game as played 
                        GameSession.findOneAndRemove({
                            'sessionId': sessionData.user.multiplayer.sessionId,
                            'createdBy': sessionData.user.username
                        }).then(() => {
                            User.findOneAndUpdate({
                                'username': sessionData.user.username
                            }, { $inc: { 'statistic.gamesPlayed': 1 } }).then(() => {
                                console.log('User left mid-game')
                            })

                            Reflect.deleteProperty(gameStates, ws.id)
                        })
                    }
                } else Reflect.deleteProperty(gameStates, ws.id)
            });
        } else {
            console.log(err)
        }
    })
}

module.exports = {
    loop,
    wsServerCallback
};