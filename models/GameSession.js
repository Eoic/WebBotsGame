const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const GameSessionSchema = new Schema({
    createdBy: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    data: [{
        username: mongoose.Schema.Types.String,
        code: mongoose.Schema.Types.String
    }]
})

let GameSession = mongoose.model('game_session', GameSessionSchema);
module.exports = GameSession;