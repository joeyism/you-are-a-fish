/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


require('./config/express')(app);
require('./routes')(app);

io.on('connection', function(socket){
    console.log(socket.handshake.headers.host+' has connected');
    socket.on('disconnect',function(){
        console.log(socket.handshake.headers.host+' has disconnected');
    });

    socket.on('chat message',function(msg){
        io.emit('chat message', msg);
    });
});


// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
