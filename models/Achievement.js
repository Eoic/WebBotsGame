const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
    key: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    title: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    description: {
        type: mongoose.Schema.Types.String,
        required: false
    }
})

let Achievement = mongoose.model('achievement', AchievementSchema);
module.exports = Achievement;