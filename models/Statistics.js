/** Stores user statistics and unlocked achievements as embedded document */

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const StatisticsSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    gamesWon: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    gamesLost: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    level: {
        type: mongoose.Schema.Types.Number,
        default: 1
    },
    experience: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    achievements: [{
        unlocked: mongoose.Schema.Types.ObjectId
    }]
})

let Statistics = mongoose.model('statistics', StatisticsSchema);
module.exports = Statistics;