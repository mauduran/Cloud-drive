const mongoose = require('mongoose');


let Notification = mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    message: String,
    date: {
        type:Date,
        default: Date.now 
    },
    emitterUserId: {
        type: mongoose.Schema.Types.ObjectId
    }
})

module.exports = Notification;
