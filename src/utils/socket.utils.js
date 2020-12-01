const socketIo = require('socket.io');
const fileUtils = require('./file.utils');
const socketUtils = require('./socket-dictionary.utils');
const notificationUtils = require('./notification.utils');

const socketInit = (server) => {

    const io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Authorization', 'userId'],
            credentials: true
        }
    });

    io.on('connection', socket => {
        const authToken = socket.handshake.headers['authorization'];
        const userId = socket.handshake.headers['userid'];

        console.log(userId);

        socketUtils.addActiveUser(socket.id, userId);
        console.log('Client connected', socket.id);

        socket.on('disconnect', () => {
            socketUtils.removeActiveUser(userId);
            console.log('Client disconnected');
        });

        socket.on('notification', async data => {
            let file = data.file;
            let sharedWith = data.sharedWith;
            let type = data.type;
            let message = '';

            switch (type) {
                case 'share':
                    message = 'shared file';
                    await fileUtils.updateFileSharing(file._id, file.owner.id, sharedWith);
                    break;
                case 'update':
                    message = 'updated file';
                    break;
                case 'delete':
                    message = 'deleted file';
                    break;
                case 'verify':
                    message = 'change verification on file';
                    break;
                default:
                    break;
            }

            const emitter = (file.owner.id == userId) ? file.owner : sharedWith
                .map(user => ({
                    email: user.email,
                    id: user.userId
                }))
                .find(user => user.id == userId);

            console.log(data);
            console.log(sharedWith);

            if (!message) return;
            try {
                if (sharedWith) {
                    sharedWith.forEach(async user => {
                        await notificationUtils.generateNotification(user.userId, message, file, emitter);
                        userSocket = socketUtils.getSocketIdFromUser(user.userId);

                        if (userSocket) {
                            socket.to(userSocket).emit('notification', {
                                message,
                                file,
                                emitter,
                                type
                            });
                        }
                    })
                }
                if (emitter.id != file.owner.id) {
                    await notificationUtils.generateNotification(file.owner.id, message, file, emitter);

                    userSocket = socketUtils.getSocketIdFromUser(file.owner.id);
                    if (userSocket) {
                        console.log("Notificaton message")
                        console.log(userSocket)

                        socket.to(userSocket).emit('notification', {
                            message,
                            file,
                            type
                        });
                    }
                }
            } catch (error) {
                console.log(error);
                socket.emit("notificationError", {
                    error: "Could not create notification for " + message
                })
            }
        })

        socket.on('comment', async data => {
            let file = data.file;
            let message = data.body;
            let sharedWith = file.sharedWith;

            console.log("userId");
            console.log(userId);
            const emitter = (file.owner.id == userId) ? file.owner : file.sharedWith
                .map(user => ({
                    email: user.email,
                    id: user.userId
                }))
                .find(user => user.id == userId);

            try {
                console.log("emitter!")
                console.log(emitter);
                let comment = await fileUtils.writeComment(file, emitter, message);
                sharedWith.forEach(async user => {
                    await notificationUtils.generateNotification(user.userId, message, file, emitter);
                    let userSocket = socketUtils.getSocketIdFromUser(user.userId);

                    if (userSocket) {
                        if (emitter.id != user.userId) {
                            io.to(userSocket).emit('notification', {
                                message: 'commented file',
                                file,
                                emitter,
                                type: 'comment'
                            });
                        }
                        io.to(userSocket).emit('comment', comment);
                    }
                })

                let userSocket = socketUtils.getSocketIdFromUser(file.owner.id);
                if (userSocket) {
                    if (emitter.id != file.owner.id) {
                        await notificationUtils.generateNotification(file.owner.id, message, file, emitter);
                        io.to(userSocket).emit('notification', {
                            message: 'commented file',
                            file,
                            emitter,
                            type: 'comment'
                        });
                    }
                    io.to(userSocket).emit('comment', comment);
                }
            } catch (error) {
                console.log(error);
            }
        })

        socket.on('deleteComment', async data => {
            let file = data.file;

            let fileId = file._id;
            let sharedWith = file.sharedWith;

            let commentId = data.comment._id;
            let userId = data.userId;
            let message = 'deleted comment';
            let type = data.type;

            const emitter = (file.owner.id == userId) ? file.owner : file.sharedWith
                .map(user => ({
                    email: user.email,
                    id: user.userId
                }))
                .find(user => user.id == userId);
            try {
                let newComment = await fileUtils.deleteComment(fileId, commentId);
                sharedWith.forEach(async user => {
                    await notificationUtils.generateNotification(user.userId, message, file, emitter);
                    let userSocket = socketUtils.getSocketIdFromUser(user.userId);

                    if (userSocket) {
                        socket.to(userSocket).emit('notification', {
                            message: message,
                            file,
                            emitter: emitter,
                            type
                        });
                        io.to(userSocket).emit('deleteComment', newComment);
                    }
                })

                let userSocket = socketUtils.getSocketIdFromUser(file.owner.id);
                if (userSocket) {
                    if (emitter.id != file.owner.id) {
                        await notificationUtils.generateNotification(file.owner.id, message, file, emitter);
                        socket.to(userSocket).emit('notification', {
                            message: message,
                            file,
                            emitter,
                            type
                        });
                    }
                    io.to(userSocket).emit('deleteComment', newComment);
                }
            } catch (error) {
                console.log(error);
            }
        })
    });
}

module.exports = {
    socketInit
}