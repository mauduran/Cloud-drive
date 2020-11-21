const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const db = require('./config/db-connection');
const dbStates = require('./src/utils/dbStates');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger.config');

const userRouter = require('./src/routes/user.route');
const fileRouter = require('./src/routes/files.route');
const filePermissionsRouter = require('./src/routes/filePermissions.route');
const fileUploadUtils = require('./src/utils/file-upload.utils');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', 'src/views');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.render('api', {dbstatus: dbStates[db.connection.readyState]});
})
app.get('/api', (req, res)=>{
    res.render('api', {dbstatus: dbStates[db.connection.readyState]});
})

app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.use('/api/users', userRouter);

app.use('/api/files', fileRouter);


app.use('/api/filePermissions', fileRouter);


app.listen(PORT, ()=>{
    console.log("Server running on PORT " + PORT);
})