const FileSchema = require('../models/file.model');
const fileConstants = require('../constants/file.constants');

const createFile = async (path, fileName, owner) => {
    let newFile = {
        path,
        fileName,
        storageId: Math.floor(Math.random()*1000), //This is going to be substituted with the uploadId to S3
        owner,
        accessedBy: [],
        sharedWith: [],
        logs: []
    }

    try {
        let FileDocument = FileSchema(newFile);
        await FileDocument.save();
        
        return Promise.resolve(FileDocument);
    } catch (error) {
        return Promise.reject(null);
    }
}


// Needs some tweaking
const findFiles = async (owner, path) => {
    try {
        const files = await FileSchema.find({owner, path});
        return Promise.resolve(files);
    } catch (error) {
        return Promise.reject(error);
    }
}

const findFile = async (path, fileName, owner) =>{
    try {
        const file = await FileSchema.find({path, fileName, owner, status: fileConstants.STATUS_TYPES.ACTIVE});
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


const existsDirectory = async (path, owner) => {
    try {
        let splitIndex = path.lastIndexOf('/');
        let prevPath = path.substring(0, splitIndex);
        let dirname = path.substring(splitIndex+1);
        if(!prevPath) prevPath = '/';
        const directory = await FileSchema.find({path: prevPath, fileName: dirname, owner, isDirectory: true, status: fileConstants.STATUS_TYPES.ACTIVE});
        if(directory.length) return Promise.resolve(true)
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
    removeDirectory
}