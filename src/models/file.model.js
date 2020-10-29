const mongoose = require('mongoose');

const FileLogSchema = require('./fileLog.model.js');

const fileUtils = require('../utils/file.utils');

let fileSchema = mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
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
        enum: Object.values(fileUtils.STATUS_TYPES),
        default: fileUtils.STATUS_TYPES.ACTIVE

    },
    requiresVerification: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: Object.values(fileUtils.VERIFICATION_STATUS_TYPES),
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
    sharedWith:  [mongoose.Schema.Types.ObjectId],
    logs: [FileLogSchema]
})

let File = mongoose.model("file", fileSchema);

module.exports = File;