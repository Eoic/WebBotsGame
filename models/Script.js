const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScriptSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

let Script = mongoose.model('script', ScriptSchema);
module.exports = Script;