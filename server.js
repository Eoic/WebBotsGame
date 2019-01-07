const express = require('express');
const app = express();
const expressHbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuidv4 = require('uuid/v4');
const cookieParser = require('cookie-parser')
const useRoutes = require('./routes/routes');
const morgan = require('morgan');
const config = require('./config');
const { connect } = require('./models/Index');
connect(process.env.MONGO_URI || config.mongoURI);
const port = process.env.PORT || config.devPort;
const WebSocket = require('ws');
const Handlebars = require('handlebars')
const Identicon = require('identicon.js');
const MemoryStore = require('memorystore')(session)
const store = new MemoryStore()

// Game logic
const { loop, wsServerCallback } = require('./game-api/core');

// Create handlebars engine instance
const hbs = expressHbs.create({
    defaultLayout: 'layout',
    extname: '.hbs',
    partialsDir: 'views/partials',
    helpers: {
        getPercent: (numerator, denominator) => {
            if (denominator !== 0 && numerator <= denominator)
                return Math.round((numerator / denominator) * 100)

            return 0
        },
        increment: (number) => ++number,
        getValueOrEmpty: (data) => (typeof data !== 'undefined') ? data : '',
        isTrue: (value) => (value === true),
        isDefined: (value) => (typeof value !== 'undefined') ? true : false,
        generateImageFromSource: (hash) => {
            const identiconData = new Identicon(hash, { size: 420, foreground: [128, 145, 202, 255] }).toString()
            const result = `<img src="data:image/png;base64,${identiconData}"
                            style='max-width: 95px; border-radius: 3px;' alt="User avatar" />`
            return new Handlebars.SafeString(result);
        },
        compareStrings: (left, right) => {
            if (left.equals(right))
                return "selected"
        }
    }
});

// Set handlebars view engine
app.set('view engine', '.hbs');
app.engine('.hbs', hbs.engine);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(session({
    resave: false,
    genid: () => uuidv4(),
    saveUninitialized: false,
    secret: config.sessionKey || process.env.SESSION_KEY,
    key: 'connect_sid',
    cookie: {
        maxAge: config.cookieAge || process.env.COOKIE_AGE
    },
    store
}));

app.use(morgan('tiny'));
app.use(cookieParser())
useRoutes(app);

const server = app.listen(port);

// Start game web socket server and game loop
const wsServer = new WebSocket.Server({ server });
wsServer.on('connection', (ws, req) => {
    wsServerCallback(ws, req, store)
});

loop();
