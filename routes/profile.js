const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Achievement = require('../models/Achievement')

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
        'statistic.gamesPlayed': 1,
        'statistic.gamesWon': 1,
        'achievements': 1
    }).lean().then(user => {
        if (!user)
            return res.sendStatus(404);

        getUnlockedAchievements(user, (unlockedAchievements) => {
            res.render('profile', {
                title: 'Profile',
                achievementsBriefList: true,
                identicons: true,
                active: { profile: true },
                scripts: user.scripts,
                selectedScript: (typeof user.multiplayerScript !== 'undefined' && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
                level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
                experience: user.statistic.experience,
                experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
                gamesWon: user.statistic.gamesWon,
                gamesLost: user.statistic.gamesPlayed - user.statistic.gamesWon,
                gamesPlayed: user.statistic.gamesPlayed,
                unlockedAchievements
            })
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
})

router.get('/achievements', (req, res, next) => {
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
        'statistic.experience': 1
    }).lean().then(user => {
        if (!user)
            return res.sendStatus(404);

        Achievement.find().then(achievements => {
            res.render('profile', {
                title: 'Profile',
                identicons: true,
                achievementsBriefList: false,
                active: { profile: true },
                scripts: user.scripts,
                selectedScript: (typeof user.multiplayerScript !== 'undefined' && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
                level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
                experience: user.statistic.experience,
                experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
                achievements
            })
        }).catch(err => {
            res.status(500).send(err.message)
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
})

function getUnlockedAchievements(user, callback) {
    let keys = []

    if (user.achievements !== undefined) {
        user.achievements.forEach(item => {
            keys.push(item.key)
        });
    }

    Achievement.find({
        'key': { $in: keys }
    }).select({
        '_id': 0,
        'key': 1,
        'title': 1,
        'description': 1,
        'iconName': 1
    }).then(achievements => {
        achievements.sort(compareByKey)
        user.achievements.sort(compareByKey)
        
        user.achievements.forEach((achievement, index) => {
            achievements[index].unlockedAt = achievement.unlockedAt
        })

        callback((achievements !== undefined) ? achievements : [])
    })
}

function compareByKey(left, right) {
    if(left.key < right.key)
        return -1
    else if(left.key > right.key)
        return 1

    return 0
}

module.exports = router;