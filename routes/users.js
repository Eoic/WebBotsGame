const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { sendMail, getPasswordResetEmail } = require('../utils/mailer')
const crypto = require('crypto')
const RANDOM_BYTES = 24
const SALT_ROUNDS = 10
const bcryptjs = require('bcryptjs')
const passwordResetLifespan = require('../config').passwordResetLifespan

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
router.delete('/manage-users/:id', (req, res, next) => {
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

router.get('/restore-password', (req, res) => {
    console.log(req.protocol)
    res.render('restorePassword', {
        title: 'Reset password'
    })
})

router.post('/reset-password', (req, res) => {

    crypto.randomBytes(RANDOM_BYTES, ((err, buffer) => {
        const hash = buffer.toString('hex')
        const expiresAt = Date.now() + passwordResetLifespan

        User.findOne({
            email: req.body.email
        }).then(user => {
            if (!user) {
                res.render('restorePassword', {
                    errors: ["Couldn't find user with this email."]
                })
            } else {
                User.findOneAndUpdate({
                    email: req.body.email
                }, {
                        resetPasswordToken: hash,
                        resetPasswordTokenExpires: expiresAt
                    }
                ).then(() => {

                    // Send email with token
                    const messageBody = getPasswordResetEmail(req.body.email, `${req.protocol}://${req.get('host')}/users/change-password/${hash}`)
                    sendMail(messageBody)

                    res.render('success', {
                        title: 'Password reset',
                        message: 'Password reset request successful. Please check your email.'
                    })
                })
            }
        })
    }))
})

router.get('/change-password/:id', (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.id
    }).then(user => {
        if (!user)
            res.redirect('/')
        else {
            res.render('changePassword', {
                title: 'Set new password',
                token: req.params.id,
                errors: (typeof req.query.errors !== 'undefined') ? [req.query.errors] : []
            })
        }
    })
})

router.post('/change-password/:id', (req, res) => {
    if (req.body.password === req.body.newPassword) {
        bcryptjs.hash(req.body.password, SALT_ROUNDS).then(hash => {
            User.findOne({
                resetPasswordToken: req.params.id
            }, 'resetPasswordTokenExpires').then(user => {
                if (user) {

                    const currentDate = Date.now()
                    const tokenDate = new Date(user.resetPasswordTokenExpires)

                    // Id password reset token is still not expired
                    if (tokenDate > currentDate) {
                        User.updateOne({
                            resetPasswordToken: req.params.id
                        }, {
                                password: hash
                            }).then(() => {
                                // Remove token after successful password reset
                                User.updateOne({
                                    resetPasswordToken: req.params.id
                                }, {
                                        resetPasswordToken: null,
                                        resetPasswordTokenExpires: null
                                    }).then(() => {
                                        res.render('success', {
                                            title: 'Password change',
                                            message: `Password change successful. You may login now.`
                                        })
                                    })
                            })
                    } else {
                        res.render('error', {
                            title: 'Cannot reset password',
                            message: 'Password reset token expired'
                        })
                    }
                }
            })
        }).catch(err => {
            console.log(err)
        })
    } else {
        // If passwords doesnt match, pass errors and re-render page
        const encodedString = encodeURIComponent('Passwords doesn\'t match')
        res.redirect(`/users/change-password/${req.params.id}/?errors=${encodedString}`)
    }
})

module.exports = router