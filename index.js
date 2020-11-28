const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const db = require('./config/db-connection');
const dbStates = require('./src/utils/dbStates');
const swaggerUI = require('swagger-ui-express');
const socketIo = require('socket.io');
const swaggerDocs = require('./config/swagger.config');

const userRouter = require('./src/routes/user.route');
const fileRouter = require('./src/routes/files.route');

const socketUtils = require('./src/utils/socket-dictionary.utils');
const fileUtils = require('./src/utils/file.utils');
const notificationUtils = require('./src/utils/notification.utils');



require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', 'src/views');

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.render('api', {
        dbstatus: dbStates[db.connection.readyState]
    });
})

app.get('/sockets', (req, res) => {
    res.json(socketUtils.getActiveUserDict());
});

app.get('/api', (req, res) => {
    res.render('api', {
        dbstatus: dbStates[db.connection.readyState]
    });
});


app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.use('/api/users', userRouter);

app.use('/api/files', fileRouter);


app.use('/api/filePermissions', fileRouter);


const server = app.listen(PORT, () => {
    console.log("Server running on PORT " + PORT);
})

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
        console.log()

        const emitter = (file.owner.id == userId) ? file.owner : sharedWith
            .map(user => ({
                email: user.email,
                id: user.userId
            }))
            .find(user => user.id == userId);


        if (!message) return;
        try {
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
            if (emitter.id != file.owner.id) {
                await notificationUtils.generateNotification(file.owner.id, message, file, emitter);

                userSocket = socketUtils.getSocketIdFromUser(file.owner.id);
                if (userSocket) {
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

        const emitter = (file.owner.id == userId) ? file.owner : file.sharedWith
            .map(user => ({
                email: user.email,
                id: user.userId
            }))
            .find(user => user.id == userId);

        try {
            let comment = await fileUtils.writeComment(file, emitter, message);
            sharedWith.forEach(async user => {
                await notificationUtils.generateNotification(user.userId, message, file, emitter);
                let userSocket = socketUtils.getSocketIdFromUser(user.userId);

                if (userSocket) {
                    socket.to(userSocket).emit('notification', {
                        message: 'commented file',
                        file,
                        emitter,
                        type: 'comment'
                    });
                    io.to(userSocket).emit('comment', comment);
                }
            })

            let userSocket = socketUtils.getSocketIdFromUser(file.owner.id);
            if (userSocket) {
                if (emitter.id != file.owner.id) {
                    await notificationUtils.generateNotification(file.owner.id, message, file, emitter);
                    socket.to(userSocket).emit('notification', {
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