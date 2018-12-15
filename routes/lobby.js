const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('lobby', {
        title: 'Lobby',
        active: {
            multiplayer: true
        }
    });
})

module.exports = router;