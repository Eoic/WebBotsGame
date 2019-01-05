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
        'multiplayerScript': 1,
        'statistic.experience': 1,
        'statistic.gamesLost': 1,
        'statistic.gamesWon': 1
    }).lean().then(user => {
        if (!user)
            return res.sendStatus(404);

        res.render('profile', {
            title: 'Profile',
            active: { profile: true },
            scripts: user.scripts,
            selectedScript: (typeof user.multiplayerScript !== 'undefined' && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
            level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
            experience: user.statistic.experience, 
            experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
            gamesWon: user.statistic.gamesWon,
            gamesLost: user.statistic.gamesLost,
            gamesPlayed: user.statistic.gamesWon + user.statistic.gamesLost
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
})

module.exports = router;