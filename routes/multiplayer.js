const express = require('express');
const router = express.Router();
const User = require('../models/User')
const GameSession = require('../models/GameSession')
const uuidv4 = require('uuid/v4');
const privateRoute = require('./privateRoute')

/**
 * Select random oponnent and gets code for both players
 */
router.get('/start-game', privateRoute, (req, res) => {
    const userOne = req.session.user.username

    User.find({
        'username': { $ne: userOne },
        'multiplayerScript': { $ne: null }
    }).select({
        'username': 1
    }).then(users => {
        if (users.length === 0) {
            res.status(202).json({ error: 'No players available' })
        }
        else {
            const userTwo = selectRandomUser(users)

            User.find({
                'username': {
                    $in: [
                        userOne,
                        userTwo
                    ]
                }
            }).select({ 'multiplayerScript': 1, 'username': 1 })
                .then(users => {

                    Promise.all([
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
                        }),
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
                        })
                    ]).then(([userOne, userTwo]) => {
                        if (userOne.scripts.length === 0) {
                            res.status(202).json({ error: 'You have not created any scripts' })
                        } else {
                            if (userTwo.scripts.length === 0) {
                                res.status(202).json({ error: 'An error occured' })
                            } else {
                                createGameSession(req, res, userOne, userTwo, req.session.user.username)
                            }
                        }
                    })
                })
        }
    })
})

router.get('/:id', privateRoute, (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    if (typeof req.session.user.multiplayer === 'undefined')
        return res.redirect('/')

    GameSession.findOne({
        sessionId: req.session.user.multiplayer.sessionId,
        createdBy: req.session.user.username
    }).then(user => {
        if (!user) {
            res.redirect('/')
        } else {
            res.render('multiplayer', {
                title: 'Multiplayer',
                active: {
                    multiplayer: true
                }
            });
        }
    })
})

function selectRandomUser(userList) {
    return userList[Math.floor(Math.random() * userList.length)].username
}

function removeOldSession(user) {
    return GameSession.findOneAndRemove({
        'sessionId': user.multiplayer.sessionId,
        'createdBy': user.username
    })
}

function createNewSession(createdBy, sessionId, userOne, userTwo) {
    return GameSession.create({
        'createdBy': createdBy,
        'sessionId': sessionId
    })
}

function createGameSession(req, res, userOne, userTwo, createdBy) {
    const sessionId = uuidv4()
    const newSessionPromise = createNewSession(createdBy, sessionId, userOne, userTwo)
    const deleteOldSessionPromise = (typeof req.session.user.multiplayer !== 'undefined') ?
                                    removeOldSession(req.session.user) : Promise.resolve()
 
    Promise.all([deleteOldSessionPromise, newSessionPromise]).then(([oldSession, newSession]) => {
        GameSession.findOneAndUpdate({
            '_id': newSession._id
        }, {
                $push: {
                    data: {
                        $each: [{
                            username: userOne.username,
                            code: userOne.scripts[0].code
                        }, {
                            username: userTwo.username,
                            code: userTwo.scripts[0].code
                        }]
                    }
                }
            }).then(() => {
                req.session.user.multiplayer = { sessionId }
                res.json({ gameSessionId: sessionId })
            })
    }).catch(err => {
        console.log(err)
    })
}

module.exports = router;