const users = []

const addUser = ({id, username, room}) => {
    //clean userdata
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate username and room
    if(!username || !room)
        return {error: 'username and room are required'}

    //check for existing users
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(existingUser){
        return {error: 'username already taken'}}
    
    //store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const userIndex = users.findIndex((user) => {
        return user.id === id
    })

    if(userIndex !== -1)
        return users.splice(userIndex,1)[0]
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })
    if(!user)
        return {error: 'user not found'}
    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const roomUsers = users.filter((user) => {
        return user.room === room
    })
    if(!roomUsers)
        return []
    return roomUsers
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

