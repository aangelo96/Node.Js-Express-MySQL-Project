var express = require('express');
var app = express();

// Defining all the routes
var index = require('./routes/index');
var users = require('./routes/users');
var allocation = require('./routes/allocation');

// Linking all the routes
app.use('/', index);
app.use('/users', users);
app.use('/allocation', allocation)

module.exports = app;
