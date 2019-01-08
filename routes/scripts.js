const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose')
const scriptTemplate = require('../utils/playerScriptTemplate')
const USER_SCRIPTS_LIMIT = 5;

/**
 * Gets all scripts of specific user
 */
router.get('/', (req, res) => {
    User.findOne({
        username: req.session.user.username
    }).select({
        'scripts.name': 1
    }).lean().then(user => {
        if (!user)
            return res.sendStatus(404);

        return res.send(user.scripts);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

/**
 * Get script by objectId
 */
router.get('/:id', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {

    if (typeof req.session.user.username === 'undefined')
        return res.sendStatus(403)

    User.findOne({
        username: req.session.user.username
    }).select({
        scripts: {
            $elemMatch: {
                name: req.params.id
            }
        }
    }).lean().then(response => {
        if (response.scripts.length === 0) {
            console.log('Script with such name doesn\'t exist');
        } else {
            res.json(response.scripts[0]);
        }
    });
});

/**
 * Creates new script
 */
router.post('/', (req, res) => {

    if (typeof req.body.filename === 'undefined')
        return res.sendStatus(400);

    const regExp = /^[a-z0-9_]+$/i
    const filename = req.body.filename.trim();

    if(!filename.match(regExp))
        return res.status(200).json({ message: 'Script name should contain only alphanumeric characters and underscores' })

    User.aggregate([{
        $match: {
            username: req.session.user.username
        }
    }, {
        $project: {
            totalScripts: { $size: "$scripts" }
        }
    }]).then(response => {
        if (response[0].totalScripts >= USER_SCRIPTS_LIMIT) {
            res.status(200).json({ message: 'Max file limit reached' })
        } else {
            User.updateOne({
                username: req.session.user.username,
                scripts: {
                    $not: {
                        $elemMatch: {
                            name: {
                                $eq: filename
                            }
                        }
                    }
                }
            }, {
                    $push: {
                        scripts: {
                            name: req.body.filename,
                            code: scriptTemplate
                        }
                    }
                }).then(response => {
                    if (response.nModified === 0)
                        res.status(200).json({ message: 'Script with this name is already created' })
                    else res.status(201).json({ filename });
                }).catch(err => {
                    res.status(500).send(err.message);
                });
        }
    })
});

/**
 * Updates one script
 */
router.put('/', (req, res) => {

    let filename = req.body.filename;
    let code = req.body.code;

    User.updateOne({
        username: req.session.user.username,
        "scripts.name": filename
    }, {
            $set: {
                "scripts.$.code": code
            }
        }).then(response => {
            if (response)
                return res.sendStatus(200);

            return res.sendStatus(304)
        });
});

router.delete('/:id', (req, res) => {
    let filename = req.params.id;

    User.updateOne({
        username: req.session.user.username,
        "scripts.name": filename
    }, {
            $pull: {
                scripts: {
                    name: filename
                }
            }
        }).then(response => {
            if (response.nModified > 0)
                return res.status(200).send('Script deleted successfully.');
            return res.status(200).send('Failed to delete');
        })
});

router.post('/select-mp-script', (req, res) => {
    let selectedScriptId = null

    if (typeof req.body._id !== 'undefined')
        if (mongoose.Types.ObjectId.isValid(req.body._id))
            selectedScriptId = req.body._id

    User.findOneAndUpdate({ username: req.session.user.username }, { multiplayerScript: selectedScriptId }).then(response => {
        res.sendStatus(200)
    }).catch(err => res.sendStatus(400))
})

/** RUN CODE ROUTE (SIMULATION) */
router.post('/run-code', (req, res) => {
    let enemyScript = req.body.enemy;

    // Fetch code from db
    User.findOne({
        username: req.session.user.username
    }).select({
        scripts: {
            $elemMatch: {
                name: enemyScript
            }
        }
    }).lean().then(response => {
        return res.json({ enemyCode: response.scripts[0].code });
    });
});

module.exports = router;