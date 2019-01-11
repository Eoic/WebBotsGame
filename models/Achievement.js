const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
    key: {
        type: mongoose.Schema.Types.String,
        required: true,
        maxlength: 25,
    },
    title: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    description: {
        type: mongoose.Schema.Types.String,
        required: false
    },
    expValue: {
        type: mongoose.Schema.Types.Number,
        default: 0,
        min: 0
    },
    iconName: {
        type: mongoose.Schema.Types.String,
        required: true
    }
})

let Achievement = mongoose.model('achievement', AchievementSchema);
module.exports = Achievement;