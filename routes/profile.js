const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs')
const User = require('../models/User')
const privateRoute = require('./privateRoute')
const Achievement = require('../models/Achievement')
const SALT_ROUNDS = 10

router.get('/', privateRoute, (req, res, next) => {
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
        'achievements': 1,
        'statistic.gameTime': 1
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
                gameTime: user.statistic.gameTime,
                unlockedAchievements
            })
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
})

router.get('/achievements', privateRoute, (req, res, next) => {
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

router.get('/edit-account', privateRoute, (req, res) => {

    let error = (typeof req.query.error !== 'undefined') ? req.query.error : undefined;
    let success = (typeof req.query.success !== 'undefined') ? req.query.success : undefined 

    User.findOne({
        username: req.session.user.username
    }).select({
        'username': 1,
        'email': 1,
        'scripts.name': 1,
        'scripts._id': 1,
        'multiplayerScript': 1,
        'statistic.experience': 1
    }).lean().then(user => {
        if (!user)
            return res.sendStatus(404);

        res.render('profile', {
            title: 'Profile',
            identicons: true,
            editAccount: true,
            username: user.username,
            email: user.email,
            active: { profile: true },
            scripts: user.scripts,
            selectedScript: (typeof user.multiplayerScript !== 'undefined' && user.multiplayerScript !== null) ? user.multiplayerScript._id : 0,
            level: Math.floor(0.5 * Math.sqrt(user.statistic.experience)),
            experience: user.statistic.experience,
            experienceNext: Math.pow(2 * (Math.floor(0.5 * Math.sqrt(user.statistic.experience)) + 1), 2),
            error,
            success
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
})

router.post('/edit-account', privateRoute, (req, res) => {
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    const repeatNewPassword = req.body.repeatNewPassword

    if(newPassword.length < 6){
        sendErrorMessage(res, 'New password must be at least 6 characters long')
        return;
    } else if(newPassword !== repeatNewPassword) {
        sendErrorMessage(res, 'New passwords doesn\'t match')
        return;
    }

    User.findOne({
        '_id': req.session.user._id
    }).then(user => {
        if (!user) {
            res.sendStatus(304)
        } else {
            user.comparePasswords(currentPassword, (_err, success) => {
                if (!success) {
                    sendErrorMessage(res, 'Entered current password is incorrect')
                } else {
                    bcryptjs.hash(newPassword, SALT_ROUNDS).then(hash => {
                        User.findOneAndUpdate({ '_id': user._id }, {
                            'password': hash
                        }).then(user => {
                            sendSuccessMessage(res, 'Password changed successfully')
                        }).catch(() => {
                            sendErrorMessage(res, 'Failed to change password')
                        })
                    })
                }
            })
        }
    })

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
    if (left.key < right.key)
        return -1
    else if (left.key > right.key)
        return 1

    return 0
}

function sendErrorMessage(res, message) {
    const encodedString = encodeURIComponent(message)
    res.redirect(`/profile/edit-account/?error=${encodedString}`)
}

function sendSuccessMessage(res, message) {
    const encodedString = encodeURIComponent(message)
    res.redirect(`/profile/edit-account/?success=${encodedString}`)
}

module.exports = router;