const express = require('express');
const app = express();
const expressHbs = require('express-handlebars');
const path = require('path');
const opn = require('opn');

// Routes.
const index = require('./routes/index');
const login = require('./routes/login');

const port = process.env.PORT || 5000;

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', '.hbs');

app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    partialsDir: 'views/partials'
}));

// Routes
app.use(index);
app.use('/login', login);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    opn('localhost:5000', {
        app: 'firefox'
    });
});