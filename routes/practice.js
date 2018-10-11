const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('practice', { title: 'Practice' });
});

module.exports = router;