const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    User.find().select({
        'username': 1
    }).where('username').ne(req.session.user.username)
      .where('multiplayerScript').ne(null).then(result => {

        let errorMessage = null;

        if (typeof req.session.user.error !== 'undefined') {
            errorMessage = req.session.user.error
            req.session.user.error = undefined
        }

        res.render('lobby', {
            title: 'Lobby',
            active: { multiplayer: true },
            users: result,
            error: errorMessage
        });
    })
})

module.exports = router;