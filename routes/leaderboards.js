const express = require('express');
const router = express.Router();
const User = require('../models/User')

router.get('/', (_request, response) => {
    User.find().select({
        "username": 1,
        "statistic.gamesWon": 1,
        "statistic.gamesPlayed": 1,
        "statistic.experience": 1
    }).then((res, err) => {
        if (err)
            response.redirect('/')
        else {
            response.render('leaderboards', {
                title: 'NETBOTS | Leaderboards',
                active: {
                    leaderboards: true
                },
                users: modifyAndSort(res)
            })
        }
    })
})

/**
 * Sorts users by win rate
 * @param {Array} users All registered users 
 */
function modifyAndSort(users) {
    let usersModified = []

    users.forEach(item => {
        let winRate = 0;

        if(item.statistic.gamesWon + item.statistic.gamesPlayed !== 0)
            winRate =  Math.round((item.statistic.gamesWon / item.statistic.gamesPlayed) * 100)

        usersModified.push({
            username: item.username,
            level: Math.floor(0.5 * Math.sqrt(item.statistic.experience)),
            gamesWon: item.statistic.gamesWon,
            gamesPlayed: item.statistic.gamesPlayed,
            winRate
        })
    })

    usersModified.sort((left, right) => (left.winRate > right.winRate) ? -1 : 1)
    return usersModified;
}

module.exports = router;