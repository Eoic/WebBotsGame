const express = require('express');
const router = express.Router();
const privateRoute = require('./privateRoute')

router.get('/', privateRoute, (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (_req, res) => {
    res.render('practice', {
        title: 'Practice',
        active: {
            practice: true
        }
    });
});

module.exports = router;