const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (_req, res) => {
    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

/**
 * Send code for multiplayer
 */
router.get('/start-game', (req, res) => {
    res.status(200).json(req.session.user.multiplayer)
})

/**
 * Fetch code of both players
 */
router.get('/:id', (req, res) => {
    const userOne = req.session.user.username
    const userTwo = req.params.id

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
                    displayMessage(req, res, 'You have not selected multiplayer script')
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

                            res.render('multiplayer', {
                                title: 'Multiplayer',
                                active: { multiplayer: true }
                            });
                        }
                    }).catch(err => {
                        displayMessage(req, res, 'An error occoured')
                    })
                }
            }).catch(err => {
                displayMessage(req, res, 'An error occoured')
            })
        })
})

function displayMessage(req, res, message) {
    req.session.user.error = message
    res.redirect('/lobby')
}

module.exports = router;