const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
    res.clearCookie('connect_sid')
    res.redirect('/')
});

module.exports = router;