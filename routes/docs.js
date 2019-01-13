const express = require('express')
const router = express.Router()

router.get('/', (_req, res) => {
    res.render('documentation', {
        title: 'NETBOTS | Documentation',
        active: {
            documentation: true
        }
    })
})

module.exports = router