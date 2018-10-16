const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator/check');
const { validateLogin } = require('../utils/validator'); 

router.get('/', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/', validateLogin, (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.render('register', { title: 'Login', errors });

    // Save session
});

module.exports = router;