const MAP_WIDTH = 674
const MAP_HEIGHT = 464
const ZOOM_SCALE = 0.95;
const ROBOT_SCALE = 0.15
const spritesDir = './public/img/sprites'
const playerObjectKeys = ['playerOne', 'playerTwo']
const initPositions = [
    { x: 32,  y: 32  },
    { x: 642, y: 432 }
]
const baseAnchor =   { x: 0.5, y: 0.5 }
const turretAnchor = { x: 0.5, y: 0.7 }

/** GAME INFO CONTAINER */
let gameInfo = [];

/** LOADING BLANKET */
let loadingWindow = document.getElementById('loader-section')
let loadingProgress = document.getElementById('progress-foreground')

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
PIXI.settings.RENDER_OPTIONS.antialias = true;
PIXI.settings.RENDER_OPTIONS.forceFXAA = true;

let app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight - 5,
    backgroundColor: 0x2a2a2a,
    resolution: 1
});

gameMap.appendChild(app.view);

const loader = PIXI.loader;         // Resources loader
const map = new PIXI.Container();   // Map container
const sprites = {}                  // Loaded sprites
const gameObjects = {}              // Created game objects        

loader.add('map', `${spritesDir}/map-prop.png`)
      .add('robotBase', `${spritesDir}/robot_base.png`)
      .add('robotTurret', `${spritesDir}/robot_turret.png`)
      .on('progress', loadingProgressHandler);

loader.load((_loader, resources) => {
    playerObjectKeys.forEach(key => {
        let keyUpperCase = key.charAt(0).toUpperCase() + key.slice(1)
        sprites['robotBase' + keyUpperCase] = new PIXI.Sprite(resources.robotBase.texture)
        sprites['robotTurret' + keyUpperCase] = new PIXI.Sprite(resources.robotTurret.texture)
    })

    sprites.map = new PIXI.Sprite(resources.map.texture);
});

loader.onComplete.add(() => {
    playerObjectKeys.forEach((key, index)=> {

        // Set graphics anchor points
        let keyUpperCase = key.charAt(0).toUpperCase() + key.slice(1)
        let baseSpriteKey = 'robotBase' + keyUpperCase
        let turretSpriteKey = 'robotTurret' + keyUpperCase
        sprites[baseSpriteKey].anchor.set(baseAnchor.x, baseAnchor.y)
        sprites[turretSpriteKey].anchor.set(turretAnchor.x, turretAnchor.y)

        // Create player instances
        gameObjects[key] = createPlayerInstance(sprites[baseSpriteKey], sprites[turretSpriteKey], initPositions[index])
    })

    map.pivot.set(sprites.map.width / 2, sprites.map.height / 2)
    map.addChild(sprites.map);

    playerObjectKeys.forEach(key => {
        map.addChild(gameObjects[key])
    })

    app.stage.addChild(map);
    loadMapCoordinates();

    // Finally, hide loading window
    setTimeout(() => {
        loadingWindow.style.visibility = 'hidden'
    }, 1000)
})

function loadingProgressHandler(loader, _resource){
    loadingProgress.style.width = loader.progress + '%'
}

function createPlayerInstance(spriteBase, spriteTurret, initialPosition){
    let player = new PIXI.Container()
    player.addChild(spriteBase)
    player.addChild(spriteTurret)
    player.scale.set(ROBOT_SCALE, ROBOT_SCALE)
    player.position.set(initialPosition.x, initialPosition.y)
    return player
}

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
function onDragMove(_event) {
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
        map.position.set((window.innerWidth - 270) / 2, position.y);
    else
        map.position.set((window.innerWidth - 270) / 2, window.innerHeight / 2);
}

function updateProjectiles(_bullets){
    playerObjectKeys.forEach(_key => {
        
    })
}

/**
 * SERVER CONNECTION
 */

let connectionType = (window.location.hostname === 'localhost') ? 'ws://' : 'wss://'; 

if(window.location.hostname === 'localhost')
    connectionString = `${connectionType}${window.location.host}`;

let socket = new WebSocket(connectionString);

socket.onopen = (_event) => {
    displayMessage('success', 'Connected to server')
}

socket.onmessage = (event) => {
    let payload = JSON.parse(event.data);

    if (typeof payload.type === 'undefined')
        return;

    switch (payload.type) {
        case 'GAME_TICK_UPDATE':
            // Update positions
            playerObjectKeys.forEach(key => {
                gameObjects[key].rotation = payload[key].rotation
                gameObjects[key].position.set(payload[key].x, payload[key].y);
            })

            updateGameInfoPanel(0, payload.playerOne.health, payload.playerOne.energy)
            updateGameInfoPanel(1, payload.playerTwo.health, payload.playerTwo.energy)
            break;
        case 'INFO':
            // Misc events 
            break;
    }
}

socket.onclose = (_event) => {
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

        request.onreadystatechange = (_event) => {
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