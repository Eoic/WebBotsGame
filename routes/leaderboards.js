const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
    res.render('leaderboards', {
        title: 'NETBOTS | Leaderboards',
        active: {
            leaderboards: true
        }
    })
})

module.exports = router;