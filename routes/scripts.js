const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get script from db
router.get('/:id', (req, res) => {

    User.findOne({
        username: req.user.username,
        'scripts.name': req.params.id
    }).then(user => {
        if(!user){
            console.log("Script doesnt exist");
            // send not found status
        }
        //console.log(user.scripts);
    }).catch(err => {
        console.log(err);
    });

    res.sendStatus(200);
});

// TODO: save script to database
router.post('/', (req, res) => {
    /*
    User.update({ username: req.user.username }, {
        $push: {
            scripts: {
                name: "some other code",
                code: "some other code"
            }
        }
    }).then(response => {
        console.log(response);
    }).catch(err => {
        console.log(err);
    })
    */
});

module.exports = router;