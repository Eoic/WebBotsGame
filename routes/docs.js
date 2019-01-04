const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('documentation', {
        title: 'NETBOTS | Documentation',
        active: {
            documentation: true
        }
    })
})

module.exports = router