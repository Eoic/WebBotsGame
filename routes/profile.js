const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (_req, res) => {
    res.render('profile', {
        title: 'Profile',
        active: { profile: true }
    })
})

module.exports = router;