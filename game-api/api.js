/**
 * Functions and classes used in the game (i.e. move, rotate, shoot etc.)
 */

class Player {
    constructor(x, y, codeString) {
        this.x = x;
        this.y = y;
        this.codeString = codeString;
    }

    getCode(){
        return this.codeString;
    }
}

module.exports = {
    Player
}