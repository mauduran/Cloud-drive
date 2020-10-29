const mongoose = require('mongoose');

const ACTION_TYPES = {
    DOWNLOAD: 'download',
    VERIFICATION: 'verification',
    DELETE: 'delete',
    UPDATE: 'update'
}

let FileLog = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        enum: Object.values(ACTION_TYPES)
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = FileLog