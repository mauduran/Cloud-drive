const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect( process.env.MONGODB_URI ,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
})
.then(res => console.log("Connected to DB."))
.catch(err => console.log(err));

module.exports = mongoose;