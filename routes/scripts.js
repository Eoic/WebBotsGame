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

/**
 * Creates new script
 */
router.post('/', (req, res) => {

    if (typeof req.body.filename === 'undefined')
        return res.sendStatus(400);

    let filename = req.body.filename.trim();

    User.update({
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
                name: req.body.filename
            }
        }
    }).then(response => {
        if (response.nModified === 0)
            res.sendStatus(304);
        else res.status(200).json({ filename });
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

    User.update({
        username: req.user.username,
        "scripts.name": filename
    }, {
        $set: {
            "scripts.$.name": filename,
            "scripts.$.code": code
        }
    }).then(response => {
        console.log(response)
    });
});

router.delete('/:id', (req, res) => {
    
});

module.exports = router;