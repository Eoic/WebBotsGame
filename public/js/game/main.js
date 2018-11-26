const MAP_WIDTH = 674
const MAP_HEIGHT = 464
const ZOOM_SCALE = 0.95;
const spritesDir = './public/img/sprites'

// Setup PixiJS renderer
let gameMap = document.getElementById('game-map');

let app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight - 5,
    backgroundColor: 0x2a2a2a,
    resolution: 1
});

//PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

// Mount view to container
gameMap.appendChild(app.view);

// Load game resources
const loader = PIXI.loader;
const map = new PIXI.Container();
const sprites = {};
let anchor = {};
let playerOne = {};
let playerTwo = {};

loader.add('map', `${spritesDir}/map-prop.png`)
    .add('player', `${spritesDir}/player.png`);

loader.load((loader, resources) => {
    sprites.map = new PIXI.Sprite(resources.map.texture);
    playerOne = new PIXI.Sprite(resources.player.texture);
    playerTwo = new PIXI.Sprite(resources.player.texture);
});

/**
 * Called once game resources are loaded
 */
loader.onComplete.add(() => {
    map.pivot.set(sprites.map.width / 2, sprites.map.height / 2)
    map.addChild(sprites.map);
    map.addChild(playerOne);
    map.addChild(playerTwo);
    playerInit();
    app.stage.addChild(map);
    loadMapCoordinates();
});

/**
 * Called on map drag start
 */
function onDragStart(event) {
    this.data = event.data;
    this.dragging = true;
    this.startPosition = this.data.getLocalPosition(this);
}

/**
 * Called while map is being dragged.
 */
function onDragMove(event) {
    if (this.dragging) {
        let newPosition = this.data.getLocalPosition(this.parent);
        this.x = (newPosition.x + map.pivot.x * map.scale.x) - (this.startPosition.x * map.scale.x);
        this.y = (newPosition.y + map.pivot.y * map.scale.y) - (this.startPosition.y * map.scale.y);
    }
}

/**
 * Called once when map dragging has ended.
 */
function onDragEnd() {
    this.dragging = false;
    this.data = null;
    saveMapCoordinates();
}

map.interactive = true;
map.on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

// Event Listeners
window.onresize = () =>
    app.renderer.resize(window.innerWidth, window.innerHeight - 5);

window.onwheel = (event) => {
    if (event.deltaY < 0) {
        map.scale.x = map.scale.x * ZOOM_SCALE;
        map.scale.y = map.scale.y * ZOOM_SCALE;
    } else {
        map.scale.x = map.scale.x / ZOOM_SCALE;
        map.scale.y = map.scale.y / ZOOM_SCALE;
    }
}

/**
 * Saves map position in game scene to local storage
 */
function saveMapCoordinates() {
    const position = {
        x: map.position.x,
        y: map.position.y
    }

    localStorage.setItem('mapPosition', JSON.stringify(position))
}

/**
 * Tries to load game map coordinates from local storage.
 */
function loadMapCoordinates() {
    let position = JSON.parse(localStorage.getItem('mapPosition'));

    if (position !== null)
        map.position.set(position.x, position.y);
    else
        map.position.set(0, 60);
}

/**
 * PLAYER MANAGEMENT
 */

/**
 * Initialize players
 */
function playerInit() {
    playerWidth = playerOne.width;
    playerHeight = playerOne.height
    playerOne.pivot.set(playerWidth / 2, playerHeight / 2)
    playerTwo.pivot.set(playerWidth / 2, playerHeight / 2)
    playerOne.position.set(0 + playerWidth, 0 + playerHeight)
    playerTwo.position.set(MAP_WIDTH - playerWidth, MAP_HEIGHT - playerHeight);
}

/**
 * SERVER CONNECTION
 */
let connectionString = `wss://${window.location.host}`;
let socket = new WebSocket(connectionString);

socket.onopen = (event) => {
    displayMessage('success', 'Connected to server')
}

socket.onmessage = (event) => {
    let payload = JSON.parse(event.data);

    if (typeof payload.type === 'undefined')
        return;

    switch (payload.type) {
        case 'GAME_TICK_UPDATE':
            playerOne.position.set(payload.playerOne.x, payload.playerOne.y);
            playerTwo.position.set(payload.playerTwo.x, payload.playerTwo.y);
            break;
        case 'INFO':
            // Misc events 
            break;
    }
}

socket.onclose = (event) => {
    displayMessage('warning', 'Disconnected')
}

function runScript() {

    if (!document.querySelector('.btn-active') === null || editor.getValue().trim() === '') {
        displayMessage('error', 'Nothing to run...');
        return;
    }

    let selected = document.getElementById('scripts-dropdown')

    let enemy = {
        code: ''
    }

    if (selected !== null) {

        let request = new XMLHttpRequest();
        request.responseType = 'json';
        request.open('GET', `${window.location.origin}/scripts/${selected.value}`, true);
        request.send();

        request.onreadystatechange = (event) => {
            if (request.readyState === 4 && request.status === 200) {
                enemy.code = request.response.code;
            }
        }
    }

    // onreadystatechange is async...

    displayMessage('warning', 'Running script...')

    // Specific for simulation
    socket.send(JSON.stringify({
        code: editor.getValue(),
        payload: 'SCRIPT',
        gameType: 'SIMULATION',
        enemy: (selected !== null) ? selected.value : ''
    }));
}

function endSession() {
    socket.close();
}