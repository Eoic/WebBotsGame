const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
    validateRegistration
} = require('../utils/validator');
const {
    validationResult
} = require('express-validator/check');

router.get('/', (_req, res) => {
    res.render('register', {
        title: 'Register',
        active: {
            register: true
        }
    });
});

router.post('/', validateRegistration, (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('register', {
            title: 'Register',
            errors: errors.array(),
            form: {
                username: req.body.username,
                email: req.body.email
            }
        });
    }

    const salt = "ef89esf288sefsef28sef8seg5sf5s5f9es9fs";
    const base64Hash = Buffer.from(req.body.username.trim().toLowerCase() + salt).toString('base64')

    const user = {
        username: req.body.username.trim().toLowerCase(),
        password: req.body.password,
        email: req.body.email,
        identiconHash: base64Hash
    }

    User.create(user).then(newUser => {
        req.session.user = {
            username: newUser.username,
            identiconHash: newUser.identiconHash,
            isAdmin: newUser.isAdmin,
            _id: newUser._id
        }
        res.redirect('/profile')
    }).catch(err => {
        res.status(422).json({ err });
    });
});

module.exports = router;