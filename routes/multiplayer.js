const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (_req, res) => {
    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

router.get('/:id', (req, res) => {

    const userOne = req.session.user.username
    const userTwo = req.params.id

    User.find({
        'username': { $in: [
            userOne,
            userTwo
        ]}
    }).select({
        'username': 1,
        'multiplayerScript': 1
    }).then(result => {
        console.log(result)
    })

    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

module.exports = router;