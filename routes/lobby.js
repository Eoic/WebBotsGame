const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
    res.render('lobby', {
        title: 'Lobby',
        active: {
            multiplayer: true
        }
    });
})

router.post('/', (req, res) => {
    console.log(req.body)
    res.json({})
})

module.exports = router;