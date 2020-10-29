const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    lastConnection: {
        type:Date,
        default: Date.now
    },
    joined: {
        type:Date,
        default: Date.now
    },

})

let User = mongoose.model("user", userSchema);

module.exports = User;