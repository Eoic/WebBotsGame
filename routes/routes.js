const profile = require('./profile');
const index = require('./index');
const login = require('./login');
const logout = require('./logout');
const register = require('./register');
const practice = require('./practice');
const scripts = require('./scripts');
const multiplayer = require('./multiplayer')
const lobby = require('./lobby')
const leaderboards = require('./leaderboards')
const docs = require('./docs')
const robots = require('./robots')
const { router } = require('../game-api/core');

module.exports = function (app) {
    // Clear cookies from browser if user is not set
    // Sets response locals
    app.use((req, res, next) => {
        if (req.cookies.connect_sid && !req.session.user)
            res.clearCookie('connect_sid')
        
        if(req.session.user && req.cookies.connect_sid){
            res.locals.authenticated = true
            res.locals.user = {
                identiconHash: req.session.user.identiconHash,
                username: req.session.user.username,
            }
        }

        next()
    });
    app.use(index);
    app.use('/robots.txt', robots);
    app.use('/login', login);
    app.use('/register', register);
    app.use('/documentation', docs)
    app.use('/logout', logout);
    app.use('/profile', profile);
    app.use('/practice', practice);
    app.use('/scripts', scripts);
    app.use('/multiplayer', multiplayer);
    app.use('/lobby', lobby);
    app.use('/leaderboards', leaderboards)
    app.use(router); // Starting point for running scripts 
}