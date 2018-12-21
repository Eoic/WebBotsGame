const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    res.render('practice', {
        title: 'Practice',
        active: {
            practice: true
        }
    });
});

module.exports = router;