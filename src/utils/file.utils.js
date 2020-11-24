const FileSchema = require('../models/file.model');
const fileConstants = require('../constants/file.constants');


const createFile = async (fileData) => {
    let newFile = {
        path: fileData.path,
        fileName: fileData.fileName,
        storageId: fileData.storageName, 
        owner: {id:fileData.owner.id, email: fileData.owner.email},
        accessedBy: [],
        sharedWith: fileData.sharedWith,
        requiresVerification: fileData.needsVerification,
        verificationStatus: (fileData.needsVerification=="true")? fileConstants.VERIFICATION_STATUS_TYPES.PENDING: fileConstants.VERIFICATION_STATUS_TYPES.NOT_AVAILABLE,
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


const findFiles = async (owner, path) => {
    try {
        const files = await FileSchema.find({"owner.id":owner, path, isDirectory: false});
        const folders = await FileSchema.find({"owner.id":owner, path, isDirectory: true});
        return Promise.resolve({files, folders});
    } catch (error) {
        return Promise.reject(error);
    }
}

const findSharedFiles= async (user, path) => {
    try {
        let files = await FileSchema.find({"sharedWith.userId": user._id, isDirectory: false});
        let folders = await FileSchema.find({"sharedWith.userId": user._id, isDirectory: true});
        return Promise.resolve({files, folders});
    } catch (error) {
        return Promise.reject(error);
    }
}

const findPendingFiles = async (user, path) => {
    try {
        let files = await FileSchema.find({"sharedWith.userId": user._id, isDirectory: false, verificationStatus: fileConstants.VERIFICATION_STATUS_TYPES.PENDING});
        return Promise.resolve(files);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findFile = async (path, fileName, owner) => {
    try {
        const file = await FileSchema.find({path, fileName, "owner.id": owner, status: fileConstants.STATUS_TYPES.ACTIVE});
        if(file) return Promise.resolve(file);
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findDirectory = async (path, dirName, owner) => {
    try {
        const file = await FileSchema.find({path: path, fileName: dirName, "owner.id": owner, status: fileConstants.STATUS_TYPES.ACTIVE, isDirectory: true});
        if(file) return file;
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findFileById = async (_id, user) =>{
    try {
        const file = await FileSchema.find({_id, $or:[{"owner.id": user}, {"sharedWith.userId": user}], isDirectory: false});
        if(file) return Promise.resolve(file);
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
        const directory = await FileSchema.find({path, fileName: dirName, "owner.id":owner, isDirectory: true, status: fileConstants.STATUS_TYPES.ACTIVE});
        if(directory.length) return Promise.resolve(true);
        return Promise.resolve(false);
    } catch (error) {
        console.log(error);
        return Promise.resolve(false);
    }
}

const removeFile = async (fileId) => {
    try {
        await FileSchema.findByIdAndUpdate(fileId, {$set: {status: fileConstants.STATUS_TYPES.INACTIVE}});
        return Promise.resolve(true);
    } catch (error) {
        console.log(error);
        return Promise.reject(false);
    }
}

// Needs some tweaking
const removeDirectory =  async (fileId) => {
    try {
        const directory = await FileSchema.findById(fileId);

        if(!directory) Promise.reject("Invalid id");
        const path = directory.path;

        await FileSchema.updateMany({path: {$regex : `${path}.*`}}, {$set: {status: fileConstants.STATUS_TYPES.INACTIVE}});
        
        Promise.resolve(true);
    } catch (error) {
        Promise.reject("Unexpected error.");
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
    findDirectory
}
