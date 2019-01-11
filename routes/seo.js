const express = require('express')
const router = express.Router()
const path = require('path')
const Achievements = require('../models/Achievement')

function getFile(filename) {
    return path.join(__dirname, '..', filename)
}

router.get('/robots.txt', (_req, res) => {
    res.sendFile(getFile('robots.txt'))
})

router.get('/sitemap.xml', (_req, res) => {
    res.sendFile(getFile('sitemap.xml'))
})


// TEMPORARY
/*
router.get('/achievements', (req, res) => {
    res.render('achievementsMaker')
})

router.post('/achievements', (req, res) => {

    Achievements.create(req.body).then(result => {
        console.log(result)
    })
})
*/

module.exports = router