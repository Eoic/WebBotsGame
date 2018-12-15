const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    identiconHash: {
        type: String,
        required: true
    },
    scripts: [{
        _id: false,
        name: String,
        code: String
    }]
}, {
    timestamps: true
});

/**
 * Hash password before saving to DB
 */
UserSchema.pre('save', function (next) {
    const user = this;

    return bcrypt.hash(user.password, SALT_ROUNDS).then(hash => {
        user.password = hash;
        next();
    }).catch(err => next(err));
});

/**
 * Compare password with one stored in the database
 */
UserSchema.methods.comparePasswords = function (password, callback) {
    const user = this;
    bcrypt.compare(password, user.password, callback);
}

let User = mongoose.model('user', UserSchema);
module.exports = User;