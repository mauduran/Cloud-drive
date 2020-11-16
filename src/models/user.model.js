const mongoose = require('mongoose');

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
    },
    lastConnection: {
        type:Date,
        default: Date.now
    },
    multifactorSecret : {
        type: String,
        default : "None"
    },
    sharedWithMe : {
        type: Array
    }
})

let User = mongoose.model("user", userSchema);

module.exports = User;