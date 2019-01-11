const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    if(typeof req.session.user.multiplayer === 'undefined')
        return res.redirect('/')

    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

/**
 * Select random oponnent and gets code for both players
 */
router.get('/start-game', (req, res) => {

    const userOne = req.session.user.username

    User.find({
        'username': { $ne: userOne },
        'multiplayerScript': { $ne: null }
    }).select({
        'username': 1
    }).then(users => {
        if (users.length === 0)
            res.status(200).json({ error: 'No players available' })
        else {
            const userTwo = selectRandomUser(users)

            User.find({
                'username': {
                    $in: [
                        userOne,
                        userTwo
                    ]
                }
            }).select({ 'multiplayerScript': 1, 'username': 1 }) // oh...... 
                .then(users => {
                    User.findOne({
                        'username': users[0].username
                    }).select({
                        scripts: {
                            $elemMatch: {
                                _id: users[0].multiplayerScript
                            }
                        },
                        'username': 1,
                        '_id': 0
                    }).then(resultOne => {

                        if (resultOne.scripts.length === 0)
                            res.status(201).json({ error: 'You have not selected multiplayer script' })
                        else {

                            User.findOne({
                                'username': users[1].username
                            }).select({
                                scripts: {
                                    $elemMatch: {
                                        _id: users[1].multiplayerScript
                                    }
                                },
                                'username': 1,
                                '_id': 0
                            }).then(resultTwo => {

                                if (resultTwo.scripts.length === 0) {
                                    displayMessage(req, res, 'An error occoured')
                                } else {
                                    // Save data for multiplayer
                                    req.session.user.multiplayer = {
                                        playerOne: resultOne,
                                        playerTwo: resultTwo
                                    }

                                    // Successfull
                                    res.sendStatus(200)
                                }
                            }).catch(err => {
                                res.status(500).json({ error: 'An error occoured' })
                            })
                        }
                    }).catch(err => {
                        res.status(500).json({ error: 'An error occoured' })
                    })
                })
        }
    })
})

function selectRandomUser(userList) {
    return userList[Math.floor(Math.random() * userList.length)].username
}

module.exports = router;