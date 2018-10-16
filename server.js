const express = require('express');
const app = express();
const expressHbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');

// Config
const config = require('./config');

// Routes.
const index = require('./routes/index');
const login = require('./routes/login');
const register = require('./routes/register');

// Mongo DB connection
const connect = require('./models/Index');
connect(config.mongoURI);

const port = process.env.PORT || 5000;

// Create handlebars engine instance
const hbs = expressHbs.create({
    defaultLayout: 'layout',
    extname: '.hbs',
    partialsDir: 'views/partials',
    helpers: {
        getValueOrEmpty: (data) => (typeof data !== 'undefined') ? data : ''
    }
});

app.use('/public', express.static(path.join(__dirname, 'public')));

// Set handlebars view engine
app.set('view engine', '.hbs');
app.engine('.hbs', hbs.engine);
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use(index);
app.use('/login', login);
app.use('/register', register);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});