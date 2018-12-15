const express = require('express');
const router = express();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Main page',
        active: {
            index: true
        },
        particles: true
    });
});

module.exports = router;