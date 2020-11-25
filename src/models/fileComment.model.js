const mongoose = require('mongoose');


let Comment = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    body: {
        type: String,
        default: ''
    },
    date: {
        type:Date,
        default: Date.now 
    },
    senderEmail: {
        type: String
    },
    type: {
        type: String,
        default: "comment"
    },
    fileName: {
        type: String
    }
})

module.exports = Comment;
