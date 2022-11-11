// to hide important credentials
require('dotenv').config();
// const { API_PORT } = process.env;
const port = process.env.PORT || process.env.API_PORT;

const express = require('express');
let app = express();

const mongoose = require('mongoose');
const cors = require('cors');
// Import Routes
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const accountsRoute = require('./routes/accounts');
const transactionsRoute = require('./routes/transactions');
const cardsRoute = require('./routes/cards');
const beneficiariesRoute = require('./routes/beneficiaries');


// cookie parser
const cookieParser = require('cookie-parser');


// Connect to DB
mongoose.connect(process.env.DB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () =>
    console.log('Connected to database')
);

// Middlewares

// Post request Middleware (we use express's body parser so we can send post requests)
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
// to use cookie parser
app.use(cookieParser());


/* [NB Cross-origin resource sharing (CORS) = browser mechanism that allows a web page to use assets and data from other pages or domains.
Extends and adds flexibility to the same-origin policy (SOP). However, also provides potential for cross-domain attacks, if a website's CORS policy is poorly configured and implemented.]
The cors package available in the npm registry is used to tackle CORS errors in a Node.js application. */
// cors make the app crash !!!
// app.use(cors());

// OR
app.use(function (req, res, next) {
    // create whitelist of domains
    const whitelist = ['https://leika.netlify.app', 'http://localhost:4200'];
    const origin = req.headers.origin;
    if (whitelist.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // res.setHeader('Access-Control-Allow-Origin', 'https://leika.netlify.app');
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/accounts', accountsRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/cards', cardsRoute);
app.use('/api/beneficiaries', beneficiariesRoute);

// localhost port or heroku port
app.listen(port, () => console.log(`Server works on port: `, port));

// set the public folder as static (to display assets such as images)
app.use(express.static(__dirname + '/public'));

// display welcome to leikaback
app.get('/', async (req, res) => {
    res.send(
        '<!DOCTYPE html><html><head><title>Leika Bank API</title><link rel="icon" type="image/x-icon" href="/images/logo.ico" style="width: 50px; height: 50px;"></head><body style="display: flex;align-items: center;"><div style="font-family: sans-serif; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center"><h1 style="color: #3d3d3d;">Welcome to the Leika Bank API</h1><img src="/images/leika_woman.png" alt="leika logo" style="height: 300px; filter: hue-rotate(60deg) invert(90%) grayscale();"></div></body></html>'
    )
});
