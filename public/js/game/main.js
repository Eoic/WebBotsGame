const ZOOM_SCALE = 0.95;

// Setup PixiJS renderer
let gameMap = document.getElementById('game-map');

let app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight - 20,
    backgroundColor: 0x2a2a2a,
    resolution: 1
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

// Mount view to container
gameMap.appendChild(app.view);

// Load game resources
const loader = PIXI.loader;
const map = new PIXI.Container();
const sprites = {};
let anchor = {};   

loader.add('map', './public/img/sprites/map-prop.png');

loader.load((loader, resources) => {
    sprites.map = new PIXI.Sprite(resources.map.texture);
});

/**
 * Called once game resources are loaded
 */
loader.onComplete.add(() => {
    map.pivot.set(sprites.map.width / 2, sprites.map.height / 2)
    map.addChild(sprites.map);
    app.stage.addChild(map);
    loadMapCoordinates();
});

/**
 * Called on map drag start
 */
function onDragStart(event){
    this.data = event.data;
    this.dragging = true;
    this.startPosition = this.data.getLocalPosition(this);
}

/**
 * Called while map is being dragged.
 */
function onDragMove(event){
    if(this.dragging){
        let newPosition = this.data.getLocalPosition(this.parent);
        this.x = (newPosition.x + map.pivot.x * map.scale.x) - (this.startPosition.x * map.scale.x);
        this.y = (newPosition.y + map.pivot.y * map.scale.y) - (this.startPosition.y * map.scale.y);
    }
}

/**
 * Called once when map dragging has ended.
 */
function onDragEnd(){
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
    app.renderer.resize(window.innerWidth, window.innerHeight - 20);

window.onwheel = (event) => {
    if(event.deltaY < 0){
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
function saveMapCoordinates(){
    const position = {
        x: map.position.x,
        y: map.position.y
    }

    localStorage.setItem('mapPosition', JSON.stringify(position))
}

/**
 * Tries to load game map coordinates from local storage.
 */
function loadMapCoordinates(){
    let position = JSON.parse(localStorage.getItem('mapPosition'));

    if(position !== null)
        map.position.set(position.x, position.y);
    else 
        map.position.set(0, 60);
}