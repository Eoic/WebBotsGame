// Renderer setup
let wrapper = document.getElementById('game-map');
let app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight - 20,
    backgroundColor: 0x2a2a2a
});

wrapper.appendChild(app.view);

// Loading resources
const loader = PIXI.loader;
const map = new PIXI.Container();
const sprites = {};

loader.add('map', './public/img/sprites/map-prop.png');

loader.load((loader, resources) => {
    sprites.map = new PIXI.Sprite(resources.map.texture);
});

loader.onComplete.add(() => {
    map.addChild(sprites.map);
    app.stage.addChild(map);
});

// Event Listeners
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight - 20);
});