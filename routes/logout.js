const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.logout();
    req.session.destroy((err) => {

        if(err)
            console.log(err);
            
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;