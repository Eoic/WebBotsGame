const User = require('../models/User')
const Achievement = require('../models/Achievement')

const RULE_CONDITIONS = {
    LESS_THAN: 0,
    LESS_OR_EQUAL_THAN: 1,
    GREATER_THAN: 2,
    GREATER_OR_EQUAL_THAN: 3,
    EQUAL: 4
}

const ACHIEVEMENT_TYPE = {
    WIN: 0,
    PLAY: 1,
    DAMAGE: 2
}

Object.freeze(RULE_CONDITIONS)

const RuleSet = [{
    key: 'ACH_WIN_ONE_GAME',
    value: 1,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.WIN
}, {
    key: 'ACH_WIN_TEN_GAMES',
    value: 10,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.WIN
}, {
    key: 'ACH_WIN_FIFTY_GAMES',
    value: 50,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.WIN
}, {
    key: 'ACH_PLAY_ONE_GAME',
    value: 1,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.PLAY
}, {
    key: 'ACH_PLAY_TEN_GAMES',
    value: 10,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.PLAY
}, {
    key: 'ACH_PLAY_FIFTY_GAMES',
    value: 50,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.PLAY
}, {
    key: 'ACH_NO_GAME_DAMAGE',
    value: 0,
    condition: RULE_CONDITIONS.EQUAL,
    type: ACHIEVEMENT_TYPE.DAMAGE
}]

class AchievementUnlocker {
    constructor(ruleSet) {
        this.ruleSet = ruleSet
    }

    /**
     * Returns true if given value meets rule conditions
     * (if such rule is found)
     * @param {String} key 
     * @param {Number} statisticsValue 
     */
    unlock(key, statisticsValue) {
        const rule = this.ruleSet.find(rule => rule.key === key)
        
        if(rule === undefined)
            return false;

        return this.compare(rule.value, statisticsValue, rule.condition)
    }

    /**
     * Compares two given values by 
     * given condition
     * @param {Number} leftValue
     * @param {Number} rightValue 
     * @param {Number} condition 
     */
    compare(leftValue, rightValue, condition) {
        switch(condition) {
            case RULE_CONDITIONS.EQUAL:
                return leftValue === rightValue
            case RULE_CONDITIONS.LESS_THAN: 
                return leftValue < rightValue
            case RULE_CONDITIONS.LESS_OR_EQUAL_THAN:
                return leftValue <= rightValue
            case RULE_CONDITIONS.GREATER_THAN:
                return leftValue > rightValue
            case RULE_CONDITIONS.GREATER_OR_EQUAL_THAN:
                return leftValue >= rightValue
            default:
                return false
        }
    }
}

function updateUserAchievements(userId, gameState) {
    let unlocker = new AchievementUnlocker(RuleSet)
    let unlockedList = []

    User.findOne({
        '_id': userId
    }).select({
        'statistic': 1,
        'achievements': 1
    }).then(user => {
        unlockedList.push(...filterAchievements(user, ACHIEVEMENT_TYPE.WIN, user.statistic.gamesWon, unlocker))
        unlockedList.push(...filterAchievements(user, ACHIEVEMENT_TYPE.PLAY, user.statistic.gamesPlayed, unlocker))
        unlockedList.push(...filterAchievements(user, ACHIEVEMENT_TYPE.DAMAGE, 0, unlocker))
        
        calculateUnlockedExp(unlockedList, (unlockedExp) => {
            User.findOneAndUpdate({
                '_id': userId
            }, {
                $push: { 'achievements': unlockedList },
                $inc: { 'statistic.experience': unlockedExp }
            }).exec()
        })
    })
}

function filterAchievements(user, achievementType, statisticsValue, unlocker) {
    let unlockedList = []
    
    RuleSet.filter(rule => rule.type === achievementType).forEach(rule => {
        if(!user.achievements.some(unlocked => unlocked.key === rule.key)) {
            if(unlocker.unlock(rule.key, statisticsValue))
                unlockedList.push({ key: rule.key, unlockedAt: Date.now() })
        }
    })

    return unlockedList
}

function calculateUnlockedExp(unlockedList, callback) {
    let unlockedExp = 0
    const keys = []
    unlockedList.forEach(achievement => keys.push(achievement.key))

    Achievement.find({
        key: { $in: keys }
    }).then(achievements => {
        achievements.forEach(item => unlockedExp += item.expValue)
        callback(unlockedExp)
    })
}

module.exports = { 
    updateUserAchievements
}