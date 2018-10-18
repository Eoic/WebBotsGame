const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    if(req.isUnauthenticated())
        return res.redirect('/');
    next();    
}, (req, res) => {
    res.render('profile', { title: 'Profile' });
});

module.exports = router;