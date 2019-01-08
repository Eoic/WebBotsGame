/**
 * For running game logic (i.e. game loop(s))
 */

const { NodeVM } = require('vm2');
const uuidv4 = require('uuid/v4');
const { Player, CONSTANTS, MESSAGE_TYPE, utilities } = require('./api')
const TICK_RATE = 30
const playerKeys = ['playerOne', 'playerTwo']
const cookie = require('cookie')
const User = require('../models/User')

// TODO: 
// Import User model for statistic updating
// Round reset and statistics collection update
// End round after one of the robots reach 0 HP
// Enemy scanning API function
// Identify multiplayer game ending(reached round count)
// + Save isAdmin in session
// + Allow "Manage users" page for admin
// + Add user password reset

// FIX
// Currently wrong order of names in game info panel
// Wrong order of starting robots in mp

const context = {
    delta: 0,
    robot: {}
};

const nodeVM = new NodeVM({
    sandbox: { context },
    console: 'inherit'
});

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
    scan: () => {
        context.robot.scanEnabled = true
        return context.robot.enemyVisible
    },

    /**
     * Returns last scanned position of enemy robot
     */
    getTarget: () => {
        return context.robot.enemyTarget
    }
}

// For logging messaget so output window
const logger = {
    log: (message, messageType) => {
        context.robot.messages.push({
            message,
            type: messageType
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
    // Iterate throug player pairs
    for (let clientID in gameStates) {
        context.delta = delta
        
        // Updates multiplayer game info (if exists)
        updateMultiplayerInfo(gameStates[clientID])

        // Run code for each player
        playerKeys.forEach((key, index) => {
            utilities.resetCallMap(callMap)
            context.robot = gameStates[clientID][key]
            context.robot.messages = []

            try {
                gameStates[clientID].code[key].update()
            } catch (err) {
                console.log(err)
            }

            utilities.insideFOV(context.robot, gameStates[clientID][playerKeys[1 ^ index]])
            utilities.wallCollision(context.robot.getPosition(), utilities.getExportedFunction(gameStates[clientID].code[key], 'onWallHit'))
            utilities.checkForHits(gameStates[clientID][playerKeys[1 ^ index]].bulletPool, context.robot, utilities.getExportedFunction(gameStates[clientID].code[key], 'onBulletHit'))
            context.robot.updateBulletPositions(context.delta, utilities.getExportedFunction(gameStates[clientID].code[key], 'onBulletMiss'))
        });

            
        // Send game update after game state were updated
        sendUpdate(gameStates, clientID)
    }
}

function sendUpdate(gameStates, clientId) {
    if (gameStates[clientId].socket.readyState === 1) {
        gameStates[clientId].socket.send(JSON.stringify({
            type: 'GAME_TICK_UPDATE',
            playerOne: gameStates[clientId].playerOne.getObjectState(),
            playerTwo: gameStates[clientId].playerTwo.getObjectState(),
            gameSession: (typeof gameStates[clientId].multiplayerData !== 'undefined') ? gameStates[clientId].multiplayerData : null,
            gameType: gameStates[clientId].gameType
        }))
    }
}

/**
 * Updates info about multiplayer game session
 * @param {Object} gameState 
 */
function updateMultiplayerInfo(gameState) {
    if (typeof gameState.multiplayerData === 'undefined')
        return;

    gameState.multiplayerData.elapsedTicks++

    if (gameState.multiplayerData.elapsedTicks >= CONSTANTS.ROUND_TICKS_LENGTH) {
        gameState.multiplayerData.elapsedRounds++
        gameState.multiplayerData.elapsedTicks = 0
    }
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
function createGameObjects(scripts, playerKeys, ws, gameType) {
    let code = compileScripts(scripts, playerKeys)

    gameStates[ws.id] = {
        playerOne: new Player(CONSTANTS.P_ONE_START_POS.X, CONSTANTS.P_ONE_START_POS.Y, 0),
        playerTwo: new Player(CONSTANTS.P_TWO_START_POS.X, CONSTANTS.P_TWO_START_POS.Y, Math.PI),
        socket: ws,
        gameType,
        code
    }

    if (gameType === 'M') {
        gameStates[ws.id]['multiplayerData'] = {
            elapsedTicks: 0,
            elapsedRounds: 1
        }
    }
}

/**
 * Client connection event handler
 * @param { Object } ws Web socket object
 */
const wsServerCallback = (ws, req, store) => {
    const cookieObject = cookie.parse(req.headers.cookie)
    const sessionId = cookieObject['connect_sid'].slice(2, 38) // !!!

    store.get(sessionId, (err, data) => {

        // User autenticated
        if (!err) {
            ws.id = uuidv4();

            ws.on('message', (data) => {

                let payload = JSON.parse(data);

                switch (payload.type) {
                    case 'SIMULATION':
                        createGameObjects([payload.playerCode, payload.enemyCode], ['playerOne', 'playerTwo'], ws, 'S')
                        break;
                    case 'MULTIPLAYER':
                        createGameObjects([payload.multiplayerData.playerOne.scripts[0].code,
                                           payload.multiplayerData.playerTwo.scripts[0].code],
                                           ['playerOne', 'playerTwo'], ws, 'M')
                        break;
                    default:
                        return 0;
                }
            });

            // Delete player connection from gameStates array
            ws.on('close', () => {
                delete gameStates[ws.id]
            });
        }
    })
}

module.exports = {
    loop,
    wsServerCallback
};