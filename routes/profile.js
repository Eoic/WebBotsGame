const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    User.findOne({
        username: req.session.user.username
    }).select({
        'scripts.name': 1,
        'scripts._id': 1,
        'multiplayerScript': 1
    }).lean().then(user => {
        if (!user)
            return res.sendStatus(404);

        res.render('profile', {
            title: 'Profile',
            active: { profile: true },
            scripts: user.scripts,
            selectedScript: (user.multiplayerScript !== null) ? user.multiplayerScript._id : 0
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
})

module.exports = router;