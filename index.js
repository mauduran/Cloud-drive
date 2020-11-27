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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.render('api', { dbstatus: dbStates[db.connection.readyState] });
})

app.get('/sockets', (req, res) => {
    res.json(socketUtils.getActiveUserDict());
});

app.get('/api', (req, res) => {
    res.render('api', { dbstatus: dbStates[db.connection.readyState] });
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

    socket.on('shareFile', async data => {
        
        const {sharedWith, file} = data;

        console.log("Archivo compartido")

        try {
            await fileUtils.updaterFileSharing(file._id, userId, sharedWith);
            
            sharedWith.forEach(async user => {
                await notificationUtils.generateNotification(user.userId, "Shared file", file);
                userSocket = socketUtils.getSocketIdFromUser(user.userId);

                if(userSocket) {
                    socket.to(userSocket).emit('notification', {message: "File shared", file: file})
                }
            })
        } catch (error) {
            console.log(error);
            socket.emit("shareError", {error: "Could not share file with people."})
        }

    })

    socket.on('newVersion', async data => {
        let file = data.file;
        let sharedWith = data.file.sharedWith;
        try {
            
            sharedWith.forEach(async user => {
                await notificationUtils.generateNotification(user.userId, "Updated file", file);
                userSocket = socketUtils.getSocketIdFromUser(user.userId);
                
                if(userSocket) {
                    socket.to(userSocket).emit('notification', {message:'File updated', file:file});
                }
            })
        } catch (error) {
            console.log(error);
            socket.emit("shareError", {error: "Could not share file with people."})
        }
    })


    // socket.on('likedNews', data => {
    //   console.log('User liked news: ', data);

    //   // io.emit('likedNews', data);
    //   socket.broadcast.emit('likedNews', {...data, user: userName});
    // })

});
