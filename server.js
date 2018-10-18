const express = require('express');
const app = express();
const expressHbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuidv4 = require('uuid/v4');
const passport = require('passport');
const User = require('./models/User');
const LocalStrategy = require('passport-local').Strategy;
const useRoutes = require('./routes/routes');
const flash = require('connect-flash');
const { authStrategyCallback } = require('./utils/validator');
const morgan = require('morgan');
const config = require('./config');
const MongoStore = require('connect-mongo')(session);
const { connect, dbConnection } = require('./models/Index');
connect(process.env.MONGO_URI || config.mongoURI);

const port = process.env.PORT || config.devPort;

// Create handlebars engine instance
const hbs = expressHbs.create({
    defaultLayout: 'layout',
    extname: '.hbs',
    partialsDir: 'views/partials',
    helpers: {
        getValueOrEmpty: (data) => (typeof data !== 'undefined') ? data : '',
        isTrue: (value) => (value === true)
    }
});

// Set handlebars view engine
app.set('view engine', '.hbs');
app.engine('.hbs', hbs.engine);
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
    resave: false,
    genid: () => uuidv4(),
    saveUninitialized: false,
    secret: process.env.SESSION_KEY || config.sessionKey,
    store: new MongoStore({
        mongooseConnection: dbConnection,
        collection: 'sessions'
    }),
    cookie: {
        maxAge: config.cookieAge || process.env.COOKIE_AGE
    }
}));

app.use(flash());
app.use(morgan('tiny'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(authStrategyCallback));
useRoutes(app);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId, (err, user) => {
        done(err, user);
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});