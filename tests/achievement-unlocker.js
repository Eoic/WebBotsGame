const assert = require('assert')
const { AchievementUnlocker, RuleSet, RULE_CONDITIONS } = require('../game-api/achievements')

let achievementUnlocker = new AchievementUnlocker(RuleSet)

describe('AchievementUnlocker', () => {
    describe('#unlock', () => {
        it('should return false if achievement key is not in rule set', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_NO_SUCH_KEY', 0), false)
        })

        it('should return true with ACH_WIN_ONE_GAME rule key and value of 1', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_WIN_ONE_GAME', 1), true)
        })

        it('should return true with ACH_WIN_TEN_GAMES rule key and value of 10', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_WIN_TEN_GAMES', 10), true)
        })

        it('should return true with ACH_WIN_FIFTY_GAMES rule key and value of 50', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_WIN_FIFTY_GAMES', 50), true)
        })

        it('should return true with ACH_PLAY_ONE_GAME rule key and value of 1', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_PLAY_ONE_GAME', 1), true)
        })

        it('should return true with ACH_PLAY_TEN_GAMES rule key and value of 10', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_PLAY_TEN_GAMES', 10), true)
        })

        it('should return true with ACH_PLAY_FIFTY_GAMES rule key and value of 50', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_WIN_FIFTY_GAMES', 50), true)
        })

        it('should return true with ACH_NO_GAME_DAMAGE rule key and value of 0', () => {
            assert.strictEqual(achievementUnlocker.unlock('ACH_NO_GAME_DAMAGE', 0), true)
        })
    })

    describe('#compare', () => {
        it('should return true if both number values are equal and given condition is EQUAL', () => {
            assert.strictEqual(achievementUnlocker.compare(5, 5, RULE_CONDITIONS.EQUAL), true)
        })

        it('should return false if given number values are different and given condition is EQUAL', () => {
            assert.strictEqual(achievementUnlocker.compare(5, 4, RULE_CONDITIONS.EQUAL), false)
        })

        it('should return true if both number values are equal or left one is greater than right one and given condition is GREATER_OR_EQUAL_THAN', () => {
            assert.strictEqual(achievementUnlocker.compare(8, 5, RULE_CONDITIONS.GREATER_OR_EQUAL_THAN), true)
        })

        it('should return true if left value is greater that right one and given condition is GREATER_THAN', () => {
            assert.strictEqual(achievementUnlocker.compare(5, 4, RULE_CONDITIONS.GREATER_THAN), true)
        })

        it('should return true left value is less or equal tha right value and given condition is LESS_OR_EQUAL_THAN', () => {
            assert.strictEqual(achievementUnlocker.compare(1, 4, RULE_CONDITIONS.LESS_OR_EQUAL_THAN), true)
        })

        it('should return true left value is less than right value and given condition is LESS_THAN', () => {
            assert.strictEqual(achievementUnlocker.compare(45, 105, RULE_CONDITIONS.LESS_THAN), true)
        })
    })
})