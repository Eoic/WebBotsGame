const { check, body } = require('express-validator/check');
const User = require('../models/User');

const validateRegistration = [
    check('username').trim().not().isEmpty()
    .isLength({
        min: 4,
        max: 20
    }).withMessage('Username must be between 4 and 20 characters long'),

    body('username').custom(value => {
        return User.findOne({
            username: value
        }).then(user => {
            if (user)
                throw new Error('Username is already taken')
        });
    }),

    check('email').trim().not().isEmpty()
    .isEmail().withMessage('Incorrect email format'),

    body('email').custom(value => {
        return User.findOne({
            email: value
        }).then(user => {
            if (user)
                throw new Error('This email is already in use')
        });
    }),

    check('password').isLength({
        min: 6
    }).withMessage('Password must be at least 6 characters long'),

    check('passwordRepeat', 'Passwords doesn\'t match')
    .custom((value, {
        req
    }) => value === req.body.password)
];

const authStrategyCallback = function (username, password, done) {
    User.findOne({
        username
    }).then(user => {

        if (!user)
            return done(null, false);

        user.comparePasswords(password, (err, match) => {
            if (!match)
                return done(null, false);

            return done(null, user);
        });

    }).catch(err => done(err));
}

module.exports = {
    validateRegistration,
    authStrategyCallback
}