const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessages, generateLocationMessages } = require('../src/utils/message-utils')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)

const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))

let count = 0

const io = socketio(server)

io.on('connection', (socket) => {
    
    socket.on('room', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if(error)
            return callback(error)
        
        socket.join(user.room)
        socket.emit('toAll',generateMessages('Admin',`Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('toAll', generateMessages(user.username,`${user.username} joined the chat`))
        io.emit('roomData',{
            room: user.room,
            users : getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if(!user)
            return callback('user not found')
        const filter = new Filter()
        if(filter.isProfane(message))
            return callback('Bad words not allowed')
        io.to(user.room).emit('toAll',generateMessages(user.username,message))
        callback()
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        if(!user)
            return callback('user not found')
        io.to(user.room).emit('sendLocationMessage',generateLocationMessages(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.emit('toAll',generateMessages('Admin',`${user.username} left the chat`))
            io.emit('roomData',{
                room: user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })

})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})