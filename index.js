const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jsonwebtoken = require('jsonwebtoken');
const cors = require('cors');
const app = express();

const config = require('./config/database');
const user = require('./routes/user');
const expense = require('./routes/expense');

const port = process.env.port || config.serverPort;

mongoose.Promise = global.Promise;
// Mongo Db Connection
mongoose.connect(config.uri, (err) => {
    if(err) {
        console.log('Database connection error ', err);
    } else {
        console.log('Connected to database ', config.db);
    }
});

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


// To Log Errors to console
app.use(morgan('dev'));

// Enable CORS for cross domain request/response
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello Sameer ' + port);
});

app.use('/login', user);
app.use('/expense', expense);

app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
