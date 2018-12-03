/**
 * For running game logic (i.e. game loop(s))
 */

const {
    VM,
    VMScript,
    NodeVM
} = require('vm2');
const uuidv4 = require('uuid/v4');
const { Player, CONSTANTS } = require('./api')
const User = require('../models/User');
const express = require('express');
const router = express.Router();

const TICK_RATE = 60;

const nodeVM = new NodeVM({
    console: 'inherit'
});

const context = {
    delta: 0,
    robot: {}
};

const vm = new VM({
    sandbox: { context }
});

const time = () => {
    let time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000;
}

let previous = time();
let tickLength = 1000 / TICK_RATE;
let gameStates = {};
//let socketConnections = [];

// Player API
const util = {
    moveForwardX: () => {
        if(context.robot.x < CONSTANTS.MAP_WIDTH)
            context.robot.x += context.delta * CONSTANTS.MOVEMENT_SPEED;
    },
    moveForwardY: () => {
        if(context.robot.y > 0 && context.robot.y < CONSTANTS.MAP_HEIGHT)
            context.robot.y -= context.delta * CONSTANTS.MOVEMENT_SPEED
    },
    moveBackX: () => {
        if(context.robot.x > CONSTANTS.PLAYER_BOX_SIZE)
            context.robot.x -= context.delta * CONSTANTS.MOVEMENT_SPEED;
    },
    moveBackY: () => {
        if(context.robot.y + CONSTANTS.PLAYER_BOX_SIZE < CONSTANTS.MAP_HEIGHT)
            context.robot.y += context.delta * CONSTANTS.MOVEMENT_SPEED
    },
    getState: () => {
        return context.robot;
    },
    rotate: () => {
           
    }
}

vm.freeze(util, 'util');            // Game api calls
vm.freeze(CONSTANTS, 'GAME');       // Constants

/**
 * Updates pair of players and returns their updated state
 * through web socket connection
 * @param {double} delta Time since last frame
 */
function update(delta) {
    for (let clientID in gameStates) {
        context.delta = delta

        // Player one
        context.robot = gameStates[clientID].playerOne
        //let modules = nodeVM.run(gameStates[clientID].code.playerOne);
        vm.run(gameStates[clientID].code.playerOne + 'update()');

        // Player two
        context.robot = gameStates[clientID].playerTwo;
        //modules = nodeVM.run(gameStates[clientID].code.playerTwo);
        vm.run(gameStates[clientID].code.playerTwo + 'update()');

        // Send game state update
        if (gameStates[clientID].socket.readyState === 1) {
            gameStates[clientID].socket.send(JSON.stringify({
                type: 'GAME_TICK_UPDATE',
                playerOne: gameStates[clientID].playerOne,
                playerTwo: gameStates[clientID].playerTwo
            }))
        }
    }
}

const loop = () => {
    setTimeout(loop, tickLength);
    let now = time();
    let delta = (now - previous) / 1000;
    update(delta);
    previous = now;
}

/**
 * Client connection event handler
 * @param { Object } ws 
 */
const wsServerCallback = (ws) => {

    ws.id = uuidv4();
    console.log("Conected: " + ws.id)

    ws.on('message', (data) => {

        let payload = JSON.parse(data);

        switch (payload.type) {
            case 'SIMULATION':
                // Create pair of player objects and add them to loop list
                gameStates[ws.id] = {
                    playerOne: new Player(CONSTANTS.P_ONE_START_POS.X, CONSTANTS.P_ONE_START_POS.Y),
                    playerTwo: new Player(CONSTANTS.P_TWO_START_POS.X, CONSTANTS.P_TWO_START_POS.Y),
                    code: {
                        playerOne: payload.playerCode,
                        playerTwo: payload.enemyCode
                    },
                    socket: ws
                }
                break;
            case 'MULTIPLAYER':
                //socketConnections.push(ws);
                break;
            default:
                return 0;
        }
    });

    ws.send(JSON.stringify({ message: 'Reply from server', type: 'INFO' }))

    // Delete player from gameStates array
    ws.on('close', () => {
        delete gameStates[ws.id] // :(
        console.log(gameStates)
    });
}

/** RUN CODE ROUTE (SIMULATION) */
router.post('/run-code', (req, res) => {
    let enemyScript = req.body.enemy;

    // Fetch code from db
    User.findOne({
        username: req.user.username
    }).select({
        scripts: {
            $elemMatch: {
                name: enemyScript
            }
        }
    }).lean().then(response => {
        return res.json({ enemyCode: response.scripts[0].code });
    });
});

module.exports = {
    loop,
    wsServerCallback,
    router
};

/**
 * Queue gameStates only in multiplayer.
 * When game is being created, dequeue 2 players and create pair with their 
 * socket gameStates and required objects(Player, etc.)
 */

/**
 * Multiplayer
 * 1. New game is being created.
 * 2. Get 2 sockets from queue.
 * 3. Append these as pair.
 * 4. Send to each player.
 */

 /**
  * Running code
  * 1.  Get module functions with NodeVM (update, start, etc..)
  * 2.  Run extracted functions in VM using vm.run(<function>)
  * 3.  Update function modifies global vm object
  * 4.  After code execution, get values of global object and assign
  *     them to player object. 
  * 5. Send updated data through web socket
  */

  /**
   * CODE EXECUTION
   * 1. Create context object inside sandbox
   * 2. Extract module functions through NodeVM
   * 3. Run extracted functions by stringifying them into VM run()
   */