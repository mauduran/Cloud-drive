const mongoose = require('mongoose');
const fileConstants = require('../constants/filePermission.constants');

let FilePermission = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    permission:{
        type: String,
        // enum: Object.values(PERMISSION_TYPES)
    } 
})

module.exports = FilePermission