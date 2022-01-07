const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New Websocket Connection')

    socket.emit('message', 'welcome sir!');
    
    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})