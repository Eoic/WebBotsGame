const profile = require('./profile');
const index = require('./index');
const login = require('./login');
const logout = require('./logout');
const register = require('./register');
const practice = require('./practice');

module.exports = function (app) {
    app.use((req, res, next) => {
        res.locals.auth = req.isAuthenticated();
        next();
    });
    app.use(index);
    app.use('/login', login);
    app.use('/register', register);
    app.use('/logout', logout);
    app.use('/profile', profile);
    app.use('/practice', practice);
}