const profile = require('./profile');
const index = require('./index');
const login = require('./login');
const logout = require('./logout');
const register = require('./register');
const practice = require('./practice');
const scripts = require('./scripts');
const multiplayer = require('./multiplayer')
const lobby = require('./lobby')
const { router } = require('../game-api/core');

module.exports = function (app) {
    app.use((req, res, next) => {
        res.locals.auth = req.isAuthenticated();
        if(req.isAuthenticated()){
            res.locals.user = {
                username: req.user.username,
                email: req.user.email,
                identiconHash: req.user.identiconHash
            }
        }
        next();
    });
    app.use(index);
    app.use('/login', login);
    app.use('/register', register);
    app.use('/logout', logout);
    app.use('/profile', profile);
    app.use('/practice', practice);
    app.use('/scripts', scripts);
    app.use('/multiplayer', multiplayer);
    app.use('/lobby', lobby);
    app.use(router); // Starting point for running scripts 
}