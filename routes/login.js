const express = require('express');
const router = express.Router();
const passport = require('passport');

// NOTE: Empty session is created because of flash middle ware
router.get('/', (req, res) => {
    res.render('login', {
        title: 'Login',
        errors: req.flash('error')
    });
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/profile',
    failureFlash: 'Please check your username or password',
    failureRedirect: '/login'
}));

module.exports = router;