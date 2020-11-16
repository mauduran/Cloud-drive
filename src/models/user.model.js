const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    joined: {
        type:Date,
        default: Date.now
    },
    imageUrl : {
        type : String  
    },
    lastConnection: {
        type:Date,
        default: Date.now
    },
    sharedWithMe : {
        type: Array
    },
    hash:{
        type: String
    },
    googleId:{
        type: String
    }
})

let User = mongoose.model("user", userSchema);

module.exports = User;