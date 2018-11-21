const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('multiplayer', {
        title: 'Multiplayer',
        active: {
            multiplayer: true
        }
    });
})

module.exports = router;