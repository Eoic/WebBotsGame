const { utilities, Player, GameTracker, CONSTANTS }  = require('../game-api/api')
const assert = require('assert')

let playerOne = new Player(0, 0, 0, new GameTracker(), 'TestPlayerTwo')
let playerTwo = new Player(0, 0, 0, new GameTracker(), 'TestPlayerOne')

describe('utilities', () => {
    describe('#checkBoundsLowerX()', () => {
        it(`should return true if given x coordinate of value 29 is greater than ${CONSTANTS.PLAYER_BOX_SIZE}`, () => {
            assert.strictEqual(utilities.checkBoundsLowerX(29), true)
        })

        it(`should return false if given x coordinate of value 10 is less than ${CONSTANTS.PLAYER_BOX_SIZE}`, () => {
            assert.strictEqual(utilities.checkBoundsLowerX(10), false)
        })
    })

    describe('#checkMapBounds()', () => {
        it(`should return true if given point (155, 298) is inside map bounds: X: [0, ${CONSTANTS.MAP_WIDTH}] y: [0; ${CONSTANTS.MAP_HEIGHT}]`, () => {
            assert.strictEqual(utilities.checkMapBounds(155, 298), true)
        })

        it(`should return false if given point (700, 464) is outside of map: X: [0, ${CONSTANTS.MAP_WIDTH}] y: [0; ${CONSTANTS.MAP_HEIGHT}]`, () => {
            assert.strictEqual(utilities.checkMapBounds(700, 464), false)
        })
    })
})