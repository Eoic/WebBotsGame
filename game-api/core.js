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
let connections = {};

/**
 * Updates pair of players and returns their updated state
 * through web socket connection
 * @param {double} delta Time since last frame
 */
function update(delta) {
    for (let clientID in connections) {
        let modules = nodeVM.run(connections[clientID].playerOne.getCode());
        move(delta, connections[clientID].playerOne, 1)

        // If connection is established
        if(connections[clientID].socket.readyState === 1) {
            connections[clientID].socket.send(connections[clientID].playerOne.x)
        }

        //console.log(modules.update.toString())
        //let five = vm.run(modules.update.toString() + ' ' + "update()")
        console.log(vm.run(modules.update.toString() + ' ' + "update()"))
        console.log("Global: " + vm.sandbox)
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
        let code = JSON.parse(data).code;
        connections[ws.id] = {
            playerOne: new Player(32, 32, code),
            playerTwo: new Player(642, 432, code),
            socket: ws
        }
    });

    ws.send(JSON.stringify({ message: 'Reply from server' }))

    ws.on('close', () => {
        console.log('Client disconnected');
    });
}

module.exports = {
    loop,
    wsServerCallback
};

/**
 * Queue connections only in multiplayer.
 * When game is being created, dequeue 2 players and create pair with their 
 * socket connections and required objects(Player, etc.)
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