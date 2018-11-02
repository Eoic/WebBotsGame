/**
 * For running game logic (i.e. game loop(s))
 */

const {
    VM,
    NodeVM
} = require('vm2');
const uuidv4 = require('uuid/v4');

const TICK_RATE = 60;
const vm = new NodeVM({
    console: 'inherit'
});

const time = () => {
    let time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000;
}

let previous = time();
let tickLength = 1000 / TICK_RATE;
let connections = {};

function update() {
    for (let clientID in connections) {
        let clientCode = vm.run(connections[clientID].code);
        clientCode.update();
    }
}

const loop = () => {
    setTimeout(loop, tickLength);
    let now = time();
    let delta = (now - previous) / 1000;
    update();
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
            code
        }
        //ws.send(JSON.stringify({ message: 'Reply from server' }));
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
}

module.exports = {
    loop,
    wsServerCallback
};