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
var base64 = require('base64');

require('./config/express')(app);
require('./routes')(app);

var users = [];

io.on('connection', function(socket){
    var ip = socket.request.connection.remoteAddress;
    var ipEncode = base64.encode(ip);
    users.push(ip);

    console.log(ip +' has connected. The total number of users is '+users.length);

    io.emit('connectme', JSON.stringify({user: ipEncode, length:users.length}));

    socket.on('disconnect',function(){
        users.forEach(function(user,i){
            if (user === ip){
                users.splice(ip,1);
            }
        });
        io.emit('disconnectme', ipEncode);
        console.log(ip +' has disconnected');
    });

    socket.on('chat message',function(msg){
        io.emit('chat message', JSON.stringify({msg:msg, user: ipEncode  }));
        console.log('Chat message sent by '+ip);
    });
});


// Start server
server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
