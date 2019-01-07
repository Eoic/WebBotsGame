const express = require('express');
const router = express.Router();
const User = require('../models/User')

// Get all registered users
router.get('/manage-users', (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    if (!req.session.user.isAdmin) {
        res.redirect('/')
    }
    else {
        User.find({}, 'username email createdAt updatedAt isAdmin').then(result => {
            res.render('manageUsers', {
                title: 'Manage users',
                users: result,
                active: {
                    users: true
                }
            })
        })
    }
})

// Delete user
router.delete('/manage-users/:id',  (req, res, next) => {
    if (req.session.user && req.cookies.connect_sid)
        next();
    else res.redirect('/');
}, (req, res) => {
    if (!req.session.user.isAdmin)
        res.redirect('/')
    else {
        if (typeof req.params.id !== 'undefined') {
            User.deleteOne({
                _id: req.params.id
            }).then((_response, error) => {
                if (error) res.sendStatus(500)
                else res.sendStatus(200)
            })
        }
    }
})

// Restore password
router.get('/restore-password', (req, res) => {

})

module.exports = router