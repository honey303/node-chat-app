const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const {generateLocationMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');

const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

// Middleware to render the static page
app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit("newMessage", {
        from: "Admin", 
        text: "Welcome!",
        createdAt: new Date().getTime()
    });

    socket.broadcast.emit("newMessage", generateMessage("Admin", "New user joined!"));

    socket.on('createMessage', (message, callback) => {
        console.log('New message', message);

        io.emit('newMessage', generateMessage( message.from, message.text));
        callback('This is from the server!');
        // socket.broadcast.emit('newMessage', generateMessage( message.from, message.text));
    });  

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected!');
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});