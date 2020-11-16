const mongoose = require('mongoose');

const FileLogSchema = require('./fileLog.model.js');

const fileConstants = require('../constants/file.constants');

let fileSchema = mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        default: ''
    },
    storageId: {
        type: String,
        default: null
    },
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(fileConstants.STATUS_TYPES),
        default: fileConstants.STATUS_TYPES.ACTIVE

    },
    requiresVerification: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: Object.values(fileConstants.VERIFICATION_STATUS_TYPES),
        default: "not available"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    accessedBy: [mongoose.Schema.Types.ObjectId],
    isDirectory: {
        type: Boolean,
        default: false
    },
    comments: [{body:String, date: Date, sender: String}],
    version: Number,
    sharedWith:  [mongoose.Schema.Types.ObjectId],
    logs: [FileLogSchema]
})

let File = mongoose.model("file", fileSchema);

module.exports = File;