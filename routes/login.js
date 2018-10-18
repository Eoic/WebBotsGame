const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    res.render('login', {
        title: 'Login'
        // Pollutes session store on every login page visit
        // errors: req.flash('error') 
    });
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/profile',
    failureFlash: 'Please check your username or password',
    failureRedirect: '/login'
}));

module.exports = router;