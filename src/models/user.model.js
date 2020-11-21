const mongoose = require('mongoose');

const NotificationSchema = require('./notification.model');

let userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
        unique: true,
        required: true
    },
    joined: {
        type:Date,
        default: Date.now   
    },
    imageUrl : {
        type : String,
        default: "assets/img/default-profile-pic"
    },
    lastConnection: {
        type:Date,
        default: Date.now
    },
    sharedWithMe : [mongoose.Schema.Types.ObjectId],
    hash:{
        type: String
    },
    googleId:{
        type: String
    },
    notifications: [NotificationSchema]
})

let User = mongoose.model("user", userSchema);

module.exports = User;