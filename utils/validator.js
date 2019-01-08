const { check, body } = require('express-validator/check');
const User = require('../models/User');

const validateRegistration = [
    check('username').trim().not().isEmpty()
        .isLength({
            min: 4,
            max: 20
        }).withMessage('Username must be between 4 and 20 characters long'),

    // Check for spaces in string
    check('username').custom(username =>
        !/\s/.test(username)).withMessage('Username shouldn\'t contain spaces'),

    check('username').matches(/^[a-z0-9_]+$/i)
        .withMessage('Username should consist of alphanumeric characters and underscores only'),

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

module.exports = { validateRegistration }