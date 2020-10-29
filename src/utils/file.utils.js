const FileSchema = require('../models/file.model');

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
        const files = await FileSchema.find({path, fileName, owner});
        if(file) return Promise.resolve(files);
        return Promise.resolve(null);
    } catch (error) {
        return Promise.reject(error);
    }
}


module.exports = {
    findFiles,
    findFile
}