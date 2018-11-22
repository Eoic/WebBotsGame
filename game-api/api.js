/**
 * Functions, classes and constants used in the game (i.e. move, rotate, shoot etc.)
 */

const MAP_WIDTH = 674;
const MAP_HEIGHT = 464;
const MOVEMENT_SPEED = 30;

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const Direction = Object.freeze({
    LEFT:   0,
    RIGHT:  1,
    UP:     2,
    DOWN:   3
});

function move(delta, player, direction) {
    switch (direction) {
        case 0:
            player.x -= MOVEMENT_SPEED * delta;
            break; 
        case 1: 
            player.x += MOVEMENT_SPEED * delta;
            break;
        case 2: 
            player.y += MOVEMENT_SPEED * delta;
            break;
        case 3:
            player.y -= MOVEMENT_SPEED * delta
            break;
    }   
}

module.exports = {
    Player,
    MAP_WIDTH,
    MAP_HEIGHT,
    move
}