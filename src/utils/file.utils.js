const FileSchema = require('../models/file.model');
const fileConstants = require('../constants/file.constants');

var mongoose = require('mongoose');

const removeUserFromSharedFile = async (userId) => {
    console.log(userId);
    try {
       const sharedWithMe = await FileSchema.find({"sharedWith.userId":userId});
       console.log(sharedWithMe); 
       await FileSchema.updateMany({"sharedWith.userId":userId}, {$pull: {sharedWith:{ userId: userId} }});
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(false);
    }
}

const createFile = async (fileData) => {
    let newFile = {
        path: fileData.path,
        fileName: fileData.fileName,
        storageId: fileData.storageName,
        owner: { id: fileData.owner.id, email: fileData.owner.email },
        accessedBy: [],
        sharedWith: fileData.sharedWith,
        requiresVerification: fileData.needsVerification,
        verificationStatus: (fileData.needsVerification == "true") ? fileConstants.VERIFICATION_STATUS_TYPES.PENDING : fileConstants.VERIFICATION_STATUS_TYPES.NOT_AVAILABLE,
        logs: []
    }


    try {
        let FileDocument = FileSchema(newFile);
        await FileDocument.save();

        return Promise.resolve(FileDocument);
    } catch (error) {
        console.log(error);
        return Promise.reject(null);
    }
}

const createNewVersionOfFile = async (fileData, storageName) => {
    const newVersion = fileData.version + 1;
    let newFile = {
        path: fileData.path,
        fileName: fileData.fileName,
        storageId: storageName,
        owner: fileData.owner,
        accessedBy: fileData.accessedBy,
        version: newVersion,
        comments: [...fileData.comments, {
            body: `version ${newVersion}`,
            senderId: mongoose.Types.ObjectId(fileData.owner.id),
            senderEmail: fileData.owner.email,
            date: new Date(),
            type: "newVersion"
        }],
        sharedWith: fileData.sharedWith,
        requiresVerification: fileData.requiresVerification,
        verificationStatus: fileData.verificationStatus,
        logs: fileData.logs
    }

    try {
        let FileDocument = FileSchema(newFile);
        await FileDocument.save();

        return Promise.resolve(FileDocument);
    } catch (error) {
        console.log(error);
        return Promise.reject('Unable to create new file');
    }

}

const changeFileToInactive = async (id) => {
    try {
        const result = await FileSchema.findByIdAndUpdate(id, { status: fileConstants.STATUS_TYPES.INACTIVE });
        Promise.resolve(result);
    } catch (error) {
        Promise.reject("Could not make previous file inactive");
    }
}

const findFiles = async (owner, path) => {
    try {
        const files = await FileSchema.find({ "owner.id": owner, path, status: fileConstants.STATUS_TYPES.ACTIVE, isDirectory: false });
        const folders = await FileSchema.find({ "owner.id": owner, path, status: fileConstants.STATUS_TYPES.ACTIVE, isDirectory: true });
        return Promise.resolve({ files, folders });
    } catch (error) {
        return Promise.reject(error);
    }
}

const findAllFiles = async (owner) => {
        try {
        const files = await FileSchema.find({ "owner.id": owner, isDirectory: false });
        const folders = await FileSchema.find({ "owner.id": owner, isDirectory: true });
        return Promise.resolve({ files, folders });
    } catch (error) {
        return Promise.reject(error);
    }
}

const removeUserContent = async (owner) => {
    try {
        await FileSchema.deleteMany({"owner.id": owner});
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(false);
        
    }
}

const findSharedFiles = async (user, path) => {
    try {
        let files = await FileSchema.find({ "sharedWith.userId": user._id, status: fileConstants.STATUS_TYPES.ACTIVE, isDirectory: false });
        let folders = await FileSchema.find({ "sharedWith.userId": user._id, status: fileConstants.STATUS_TYPES.ACTIVE,  isDirectory: true });
        return Promise.resolve({ files, folders });
    } catch (error) {
        return Promise.reject(error);
    }
}

const findPendingFiles = async (user, path) => {
    try {
        let files = await FileSchema.find({ "sharedWith.userId": user._id, isDirectory: false, status: fileConstants.STATUS_TYPES.ACTIVE, verificationStatus: fileConstants.VERIFICATION_STATUS_TYPES.PENDING });
        return Promise.resolve(files);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findFile = async (path, fileName, owner) => {
    try {
        const file = await FileSchema.find({ path, fileName, "owner.id": owner, status: fileConstants.STATUS_TYPES.ACTIVE });
        if (file) return Promise.resolve(file);
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findAllVersionsFileAndDelete = async (path, fileName, owner) => {
    try {
        const files = await FileSchema.find({path, fileName, "owner.id": owner});
        const deleted = await FileSchema.deleteMany({path, fileName, "owner.id": owner})
        if(files && deleted.deletedCount > 0 && deleted.ok) return Promise.resolve({files, deleted});
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findAllVersionsOfFile = async (path, fileName, owner) => {
    try {
        const files = await FileSchema.find({path, fileName, "owner.id": owner});
        if(files) return Promise.resolve(files);
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findDirectory = async (path, dirName, owner) => {
    try {
        const file = await FileSchema.find({ path: path, fileName: dirName, "owner.id": owner, status: fileConstants.STATUS_TYPES.ACTIVE, isDirectory: true });
        if (file) return file;
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findFileById = async (_id, user) => {
    try {
        const file = await FileSchema.find({ _id, $or: [{ "owner.id": user }, { "sharedWith.userId": user }], isDirectory: false });
        if (file) return Promise.resolve(file);
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}


const createDirectory = async (path, owner, directoryName) => {
    try {

        let newDir = {
            path,
            fileName: directoryName,
            isDirectory: true,
            owner,
            accessedBy: [],
            sharedWith: [],
            logs: []
        }

        let DirDocument = FileSchema(newDir);
        await DirDocument.save();

        return Promise.resolve(true);

    } catch (error) {
        console.log(error);
        return Promise.reject(false);
    }
}


const existsDirectory = async (path, dirName, owner) => {
    try {
        const directory = await FileSchema.find({ path, fileName: dirName, "owner.id": owner, isDirectory: true, status: fileConstants.STATUS_TYPES.ACTIVE });
        if (directory.length) return Promise.resolve(true);
        return Promise.resolve(false);
    } catch (error) {
        console.log(error);
        return Promise.resolve(false);
    }
}

const removeFile = async (fileId) => {
    try {
        await FileSchema.findByIdAndUpdate(fileId, { $set: { status: fileConstants.STATUS_TYPES.INACTIVE } });
        return Promise.resolve(true);
    } catch (error) {
        console.log(error);
        return Promise.reject(false);
    }
}

// Needs some tweaking
const removeDirectory = async (fileId) => {
    try {
        const directory = await FileSchema.findById(fileId);

        if (!directory) Promise.reject("Invalid id");
        const path = directory.path;

        await FileSchema.updateMany({ path: { $regex: `${path}.*` } }, { $set: { status: fileConstants.STATUS_TYPES.INACTIVE } });

        Promise.resolve(true);
    } catch (error) {
        Promise.reject("Unexpected error.");
    }
}

const updateVerificationStatus= async (id, status) => {
    try {
        await FileSchema.findByIdAndUpdate(id, { $set:{verificationStatus: status} });
        return Promise.resolve(true);
    } catch (error) {
        console.log(error);
        return Promise.reject(false);
    }
}

const updateFileSharing = async (fileId, ownerId, sharedWith) => {
    try {
        const response = await FileSchema.findOneAndUpdate({_id: fileId, "owner.id": ownerId}, {sharedWith});
        if(response) return Promise.resolve(true);

        return Promise.reject(false);
    } catch (error) {
        return Promise.reject(false);
    }
}

const writeComment = async (file, emitter, message) => {
    try {
        let newComment = {
            senderId : emitter.id,
            senderEmail: emitter.email,
            body: message,
            fileName: file.fileName,
            fileId: file._id
        }
        const res = await FileSchema.findByIdAndUpdate(file._id, {$push: {comments: newComment}}, {new:true});
        console.log(res.comments[res.comments.length - 1]);
        return Promise.resolve(res.comments[res.comments.length - 1]);

    } catch (error) {
        console.log(error);
        return Promise.reject(null);
    }
}

module.exports = {
    createFile,
    createDirectory,
    findFiles,
    findFile,
    existsDirectory,
    removeFile,
    removeDirectory,
    findFileById,
    findSharedFiles,
    findPendingFiles,
    findDirectory,
    findAllVersionsFileAndDelete,
    createNewVersionOfFile,
    changeFileToInactive,
    updateVerificationStatus,
    findAllVersionsOfFile,
    updateFileSharing,
    findAllFiles,
    removeUserContent,
    removeUserFromSharedFile,
    writeComment
}
