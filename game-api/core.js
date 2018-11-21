/**
 * For running game logic (i.e. game loop(s))
 */

const {
    VM,
    VMScript,
    NodeVM
} = require('vm2');
const uuidv4 = require('uuid/v4');
const { Player, MAP_WIDTH, MAP_HEIGHT, move } = require('./api')
const User = require('../models/User');

const TICK_RATE = 60;

const nodeVM = new NodeVM({
    console: 'inherit'
});

let context = {};

const vm = new VM({
    timeout: 1000,
    sandbox: { context }
});

const time = () => {
    let time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000;
}

let previous = time();
let tickLength = 1000 / TICK_RATE;
let gameStates = {};
let socketConnections = [];

/**
 * Updates pair of players and returns their updated state
 * through web socket connection
 * @param {double} delta Time since last frame
 */
function update(delta) {
    for (let clientID in gameStates) {
        gameStates[clientID].playerOne.x++
        gameStates[clientID].playerTwo.x--;

        /*
        let modules = nodeVM.run(connections[clientID].playerOne.getCode());
        move(delta, gameStates[clientID].playerOne, 1)
        */

        // Send state update
        if (gameStates[clientID].socket.readyState === 1) {
            gameStates[clientID].socket.send(JSON.stringify({
                type: 'GAME_TICK_UPDATE',
                playerOne: gameStates[clientID].playerOne,
                playerTwo: gameStates[clientID].playerTwo
            }))
        }

        //console.log(modules.update.toString())
        //let five = vm.run(modules.update.toString() + ' ' + "update()")
        //console.log(vm.run(modules.update.toString() + ' ' + "update()"))
        //console.log("Global: " + vm.sandbox)
        //modules.update()
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

    ws.on('message', (data) => {

        let message = JSON.parse(data);
        let code = {};

        switch (message.gameType) {
            case 'SIMULATION':
                // Get enemy script
                User.findOne({ "scripts.name": "app", username: '' },
                    {
                        _id: 0, scripts: {
                            $elemMatch: { name: message.enemy }
                        }
                    }).then(result => {
                        console.log(result.scripts[0].code);
                    });
                break;
            case 'MULTIPLAYER':
                socketConnections.push(ws); // for matchmaking
                break;
            default:
                return 0;
        }

        gameStates[ws.id] = {
            playerOne: new Player(32, 32),
            playerTwo: new Player(642, 432),
            socket: ws
        }
    });

    ws.send(JSON.stringify({ message: 'Reply from server', type: 'INFO' }))

    ws.on('close', () => {
        console.log('Client disconnected');
    });
}

module.exports = {
    loop,
    wsServerCallback
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

// MAKE SCRIPT START HTTP REQUEST, SINCE SESSION DATA IS NEEDED