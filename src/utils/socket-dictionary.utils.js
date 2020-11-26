const activeSockets = {};

const addActiveUser = (socketId, userId) => {
    activeSockets[userId] = socketId;
}

const getActiveUserDict = () => {
    return activeSockets;
}

const getSocketIdFromUser = (userId) => {
    return activeSockets[userId];
}

const removeActiveUser = (userId) => {
    delete activeSockets[userId];
}

module.exports = {
    getActiveUserDict,
    addActiveUser,
    getSocketIdFromUser,
    removeActiveUser
}