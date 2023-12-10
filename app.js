require('dotenv').config();
const express = require('express');
const http = require('http');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');

const app = express();

app.use(session({ secret: 'some secret', resave: false, saveUninitialized: false }));
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/api', apiRouter);

module.exports = app;