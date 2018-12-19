const express = require('express')
const router = express.Router()
const User = require('./../models/User')

router.get('/', (_req, res) => {
    res.render('login', {
        title: 'Login',
        active: {
            login: true
        }
    })
})

router.post('/', (req, res) => {
    User.findOne({ username: req.body.username }).then(user => {
        if (user) {
            user.comparePasswords(req.body.password, (_err, success) => {
                if (success) {
                    req.session.user = {
                        username: user.username,
                        identiconHash: user.identiconHash
                    }
                    res.redirect('/profile')
                } else
                    handleErrors(res, ['Please check your username or password'])
            })
        } else 
            handleErrors(res, ['Please check your username or password'])
    })
})

function handleErrors(response, errors){
    response.render('login', {
        title: 'Login',
        errors
    })
}

module.exports = router;