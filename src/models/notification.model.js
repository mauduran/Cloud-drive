const mongoose = require('mongoose');


let Notification = mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    message: {
        type: String
    },
    date: {
        type:Date,
        default: Date.now 
    },
    emitterUserId: {
        type: mongoose.Schema.Types.ObjectId
    },
    emitterEmail: {
        type: String
    },
    fileName: {
        type: String
    }
})

module.exports = Notification;
