const MAP_WIDTH = 674
const MAP_HEIGHT = 464
const ZOOM_SCALE = 0.95;
const spritesDir = './public/img/sprites'

/** GAME INFO CONTAINER */
let gameInfo = [];

gameInfo[0] = {
    playerHP: document.getElementById('player-one-hp'),
    playerEN: document.getElementById('player-one-en'),    
    playerHPVal: document.getElementById('player-one-hp-val'),
    playerENVal: document.getElementById('player-one-en-val'),
}

gameInfo[1] = {
    playerHP: document.getElementById('player-two-hp'),
    playerEN: document.getElementById('player-two-en'),
    playerHPVal: document.getElementById('player-two-hp-val'),
    playerENVal: document.getElementById('player-two-en-val'),
}

// Setup PixiJS renderer
let gameMap = document.getElementById('game-map');
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

let app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight - 5,
    backgroundColor: 0x2a2a2a,
    resolution: 1,
    antialias: true
});

gameMap.appendChild(app.view);

const loader = PIXI.loader;         // Resources loader
const map = new PIXI.Container();   // Map container
const sprites = {}                  // Loaded sprites
const gameObjects = {}              // Created game objects        
let resourcesLoaded = false;        // Indicates whether all game resources were loaded

loader.add('map', `${spritesDir}/map-prop.png`)
      .add('robotBase', `${spritesDir}/robot_base.png`)
      .add('robotTurret', `${spritesDir}/robot_turret.png`);

loader.load((loader, resources) => {
    sprites.robotBasePlayerOne = new PIXI.Sprite(resources.robotBase.texture)
    sprites.robotBasePlayerTwo = new PIXI.Sprite(resources.robotBase.texture)
    sprites.robotTurretPlayerOne = new PIXI.Sprite(resources.robotTurret.texture)
    sprites.robotTurretPlayerTwo = new PIXI.Sprite(resources.robotTurret.texture)
    sprites.map = new PIXI.Sprite(resources.map.texture);
});

loader.onComplete.add(() => {
    // Sprite containers
    let playerOne = new PIXI.Container()
    let playerTwo = new PIXI.Container()

    // Set graphics anchor points
    sprites.robotBasePlayerOne.anchor.set(0.5, 0.5);
    sprites.robotBasePlayerTwo.anchor.set(0.5, 0.5);
    sprites.robotTurretPlayerOne.anchor.set(0.5, 0.7);
    sprites.robotTurretPlayerTwo.anchor.set(0.5, 0.7);

    // Adding graphics
    playerOne.addChild(sprites.robotBasePlayerOne)
    playerTwo.addChild(sprites.robotBasePlayerTwo)
    playerOne.addChild(sprites.robotTurretPlayerOne)
    playerTwo.addChild(sprites.robotTurretPlayerTwo)

    // Scaling and positioning
    playerOne.scale.set(0.2, 0.2)
    playerTwo.scale.set(0.2, 0.2)

    // Events
    setInteractionEvents(playerOne)
    setInteractionEvents(playerTwo)

    playerWidth = playerOne.width;
    playerHeight = playerOne.height
    playerOne.position.set(0 + playerWidth, 0 + playerHeight)
    playerTwo.position.set(MAP_WIDTH - playerWidth, MAP_HEIGHT - playerHeight);

    // Add reference to gameObjects
    gameObjects.playerOne = playerOne
    gameObjects.playerTwo = playerTwo

    map.pivot.set(sprites.map.width / 2, sprites.map.height / 2)
    map.addChild(sprites.map);
    map.addChild(gameObjects.playerOne);
    map.addChild(gameObjects.playerTwo);
    app.stage.addChild(map);

    loadMapCoordinates();
})

/**
 * Binds events on player container 
 */
function setInteractionEvents(playerContainer){
    playerContainer.interactive = true;
    playerContainer.mouseover = () => {
        console.log(`X: ${playerContainer.position.x} Y: ${playerContainer.position.y}`)
    }
}

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

function updateGameInfoPanel(playerIndex, hp, en){
    gameInfo[playerIndex].playerHP.innerText = hp;
    gameInfo[playerIndex].playerEN.innerText = en;
    gameInfo[playerIndex].playerHPVal.value = hp;
    gameInfo[playerIndex].playerENVal.value = en;
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
            // Update positions
            gameObjects.playerOne.position.set(payload.playerOne.x, payload.playerOne.y);
            gameObjects.playerTwo.position.set(payload.playerTwo.x, payload.playerTwo.y);
            updateGameInfoPanel(0, payload.playerOne.health, payload.playerOne.energy)
            updateGameInfoPanel(1, payload.playerTwo.health, payload.playerTwo.energy)
            break;
        case 'INFO':
            // Misc events 
            break;
    }
}

socket.onclose = (event) => {
    displayMessage('warning', 'Disconnected')
}

/**
 * If enemy is selected, gets enemy code from db and send
 * received value through web socket initialize new game session
 */
function runScript() {

    if (!document.querySelector('.btn-active') === null || editor.getValue().trim() === '') {
        displayMessage('error', 'Nothing to run...');
        return;
    }

    let selected = document.getElementById('scripts-dropdown')

    if (selected !== null) {

        displayMessage('warning', 'Running script...')

        let request = new XMLHttpRequest();

        request.open('POST', `${window.location.origin}/run-code`, true);
        request.responseType = 'json';
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({ 
            enemy: selected.value.trim()
        }));

        request.onreadystatechange = (event) => {
            if (request.readyState === 4 && request.status === 200) {
                socket.send(JSON.stringify({
                    enemyCode: request.response.enemyCode,
                    playerCode: editor.getValue(),          
                    type: 'SIMULATION'                      // Payload type
                }))
            }
        }
    }
}

function endSession() {
    socket.close();
}

/**
 * gameObjects.playerOne.getChildAt(0) <- Robot base
 *                       getChildAt(1) <- Turret
 */