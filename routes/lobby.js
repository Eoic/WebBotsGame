const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (req, res) => {
    User.find().select({
        'username': 1
    }).where('username').ne(req.session.user.username).then(result => {
        res.render('lobby', {
            title: 'Lobby',
            active: {
                multiplayer: true
            },
            users: result
        });
    })
})

module.exports = router;