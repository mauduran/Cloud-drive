const mongoose = require('mongoose');

let tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token:{
        type: String,
        required: true        
    }
})

let Token = mongoose.model("token", tokenSchema);

module.exports = Token;