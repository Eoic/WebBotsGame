const express = require('express');
const router = express();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'NETBOTS - multiplayer robot programming game',
        metaDescription: {
            name: "NETBOTS | Multiplayer programming game",
            content: `Code behavior of your bots writing real JavaScript and compete
                      with other players`
        },
        active: {
            index: true
        }
    });
});

module.exports = router;