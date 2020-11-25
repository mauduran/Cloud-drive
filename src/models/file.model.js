const mongoose = require('mongoose');

const FileLogSchema = require('./fileLog.model.js');
const FilePermission = require('./filePermission.model.js')

const fileConstants = require('../constants/file.constants');
const CommentSchema = require('./fileComment.model.js');

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
        id: mongoose.Schema.Types.ObjectId,
        email: String
    },
    accessedBy: [mongoose.Schema.Types.ObjectId],
    isDirectory: {
        type: Boolean,
        default: false
    },
    comments: [CommentSchema],
    version: {
       type: Number,
       default: 0
    },
    sharedWith:  [FilePermission],
    logs: [FileLogSchema]
})

let File = mongoose.model("file", fileSchema);

module.exports = File;