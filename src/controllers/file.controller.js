const mongoose = require('../../config/db-connection');
const FileSchema = require('../models/file.model');

const createFile = async (req, res) => {
    const {path, fileName, owner} = req.body;

    //Middleware?
    if(!path || !fileName || !owner) return res.status(400).json({error: true, message: "Missing required fields"});

    //s3uploadFile()
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
    
        const file = await findFile(path, fileName, owner);

        if(file) {
            return res.status(409).json({error: true, message: "Trying to create file that already exists."});
        }
        FileDocument.save();
    
        res.json(FileDocument);
        
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}


const getFiles = async (req, res) => {
    let {owner, path} = req.body;

    console.log("GET")

    if(!path) path='/'
//   auth Middleware
    if(!owner) res.status(401).json({error: true, message:"Must provide userId"});

    try {
        const files = await findFiles(owner, path);
        return res.json(files);
    } catch (error) {
        console.log(error)
        return res.status(400).json({error: true, message: "Unexpected Error"})
    }

}



//This should go on utils.

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
    createFile,
    getFiles
}