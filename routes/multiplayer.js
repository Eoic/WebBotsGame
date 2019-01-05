const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

router.get('/:id', (req, res) => {
    console.log("reqq")
    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

module.exports = router;