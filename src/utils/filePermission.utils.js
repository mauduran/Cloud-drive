const mongoose = require('../../config/db-connection');
const UserSchema = require('../models/user.model');
const FileSchema = require('../models/file.model');
const FilePermissionSchema = require('../models/filePermission.model');
const { findByIdAndUpdate, findByIdAndDelete } = require('../models/user.model');




// let FilePermission = mongoose.Schema({
//     fileId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     permission:{
//         type: String,
//         enum: Object.values(PERMISSION_TYPES)
//     } 
// })

const addFilePermission = async (fileId, email, permission) => {
    try {
        const user = await UserSchema.findOne({ email });
        if (!user) return Promise.reject(null);
        const userId = user._id;

        const file = await FileSchema.findById(fileId);
        if (!file) return Promise.reject(null);

        let newFilePermission = {
            userId,
            fileId,
            permission
        }

        let FilePDocument = FilePermissionSchema(newFilePermission);
        await FilePDocument.save();

        return Promise.resolve(FilePDocument);


    } catch (error) {
        return Promise.reject(error);
    }
}

const removeFilePermission = async (permissionId) => {
    try {
        await FilePermissionSchema.findByIdAndDelete(permissionId);
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(false);
    }
}

const findFilePermissions = async (fileId) => {
    try {
        const file = FileSchema.findById(fileId);
        if(!file) return Promise.reject(false)
        const permissionIds = file.sharedWith; 

        const permissions = await FilePermissionSchema.find({_id: {$in: permissionIds} });
        return Promise.resolve(permissions);
    } catch (error) {
        return Promise.reject(false);
    }
}

const updateFilePermissions = (id, permission) => {
    try {
        const file = FileSchema.findByIdAndUpdate(fileId, {permission});
        if(!file) return Promise.reject(false)
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(false);
    }
}


module.exports = {
    addFilePermission,
    removeFilePermission,
    findFilePermissions,
    updateFilePermissions
}