const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * Gets all scripts of specific user
 */
router.get('/', (req, res) => {
    User.findOne({
        username: req.user.username
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

router.get('/:id', (req, res) => {
    User.findOne({
        username: req.user.username
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

    let filename = req.body.filename.trim();

    User.updateOne({
        username: req.user.username,
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
                code: "console.log('New script...')"
            }
        }
    }).then(response => {
        if (response.nModified === 0)
            res.sendStatus(304)
        else res.status(200).json({
            filename
        });
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

/**
 * Updates one script
 */
router.put('/', (req, res) => {

    let filename = req.body.filename;
    let code = req.body.code;

    User.updateOne({
        username: req.user.username,
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
        username: req.user.username,
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

module.exports = router;