const express = require('express');
const app = express();
const expressHbs = require('express-handlebars');
const path = require('path');
const opn = require('opn');

// Config
const config = require('./config');

// Routes.
const index = require('./routes/index');
const login = require('./routes/login');
const register = require('./routes/register');
const practice = require('./routes/practice');

// Mongo DB connection
const connect = require('./models/Index');
connect(config.mongoURI);

const port = process.env.PORT || 5000;

app.use('/public', express.static(path.join(__dirname, 'public')));

// Use handlebars view engine
app.set('view engine', '.hbs');

app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    partialsDir: 'views/partials'
}));

// Routes
app.use(index);
app.use('/login', login);
app.use('/register', register);
app.use('/practice', practice);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});