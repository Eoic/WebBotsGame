const RULE_CONDITIONS = {
    LESS_THAN: 0,
    LESS_OR_EQUAL_THAN: 1,
    GREATER_THAN: 2,
    GREATER_OR_EQUAL_THAN: 3,
    EQUAL: 4
}

Object.freeze(RULE_CONDITIONS)

const RuleSet = [{
    key: 'ACH_WIN_ONE_GAME',
    value: 1,
    condition: RULE_CONDITIONS.EQUAL
}, {
    key: 'ACH_WIN_TEN_GAMES',
    value: 10,
    condition: RULE_CONDITIONS.EQUAL
}, {
    key: 'ACH_WIN_FIFTY_GAMES',
    value: 50,
    condition: RULE_CONDITIONS.EQUAL
}, {
    key: 'ACH_PLAY_ONE_GAME',
    value: 1,
    condition: RULE_CONDITIONS.EQUAL
}, {
    key: 'ACH_PLAY_TEN_GAMES',
    value: 10,
    condition: RULE_CONDITIONS.EQUAL
}, {
    key: 'ACH_PLAY_FIFTY_GAMES',
    value: 50,
    condition: RULE_CONDITIONS.EQUAL
}, {
    key: 'ACH_NO_GAME_DAMAGE',
    value: 0,
    condition: RULE_CONDITIONS.EQUAL
}]

class AchievementUnlocker {
    constructor(ruleSet) {
        this.ruleSet = ruleSet
    }

    unlock(key, statisticsValue, condition) {
        const rule = this.ruleSet.find(rule => rule.key === key && rule.condition === condition)
        
        if(rule === undefined)
            return false;

        return this.compare(rule.value, statisticsValue, condition)
    }

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

module.exports = { 
    AchievementUnlocker,
    RULE_CONDITIONS,
    RuleSet
}