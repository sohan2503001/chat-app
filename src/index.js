const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {generateLocationMessage} = require('./utils/location')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const forecast = require('./utils/forecast')
const geocode = require('./utils/geocode')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New Websocket Connection')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id:socket.id, username,room})

        if(error){
            return callback(error);
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin',`Welcome ${user.username}`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message));
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//Weather 
app.get('/weather', (req, res) => {
    if(!req.query.address){
        return res.send({
            error: 'You must provide address'
        })
    }

    geocode(req.query.address, (error, {latitude, longitude, location} = {}) => {
        if (error) {
            return res.send({ error })
        }

        forecast(latitude, longitude, (error, forecastdata) => {
            if (error) {
                return console.log(error)
            }

            res.send({
                    forecast: forecastdata,
                    location,
                    address: req.query.address,
                })
        })
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})