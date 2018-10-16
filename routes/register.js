const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
    validateRegistration
} = require('../utils/validator');
const {
    validationResult
} = require('express-validator/check');

router.get('/', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

router.post('/', validateRegistration, (req, res) => {
    const errors = validationResult(req);

    console.log(errors.array());

    if (!errors.isEmpty())
        return res.render('register', {
            title: 'Register',
            errors: errors.array(),
            form: {
                username: req.body.username,
                email: req.body.email
            }
        });

    const user = {
        username: req.body.username.trim(),
        password: req.body.password,
        email: req.body.email
    }

    User.create(user).then(response => {
        // Sign JWT token
        res.status(200).json({
            response
        });
    }).catch(err => {
        res.status(422).json({
            err
        });
    });
});

module.exports = router;