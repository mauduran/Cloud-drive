const fileUploadUtils = require('../utils/file-upload.utils');
const fileUtils = require('../utils/file.utils');
const fileConstants = require('../constants/file.constants');

const createFile = async (req, res) => {

    let { path, fileName, extension, needsVerification, sharedWith, storageName } = req.body;

    let owner = { id: req._user._id, email: req._user.email };
    sharedWith = JSON.parse(sharedWith).map(user => {
        return { userId: user.id, email: user.email, permission: user.permission }
    });
    if (!path) path = '/';

    if (!fileName || !owner || !extension || !needsVerification || !storageName) return res.status(400).json({ error: true, message: "Missing required fields" });


    try {

        if (path != '/') {
            let splitIndex = path.lastIndexOf('/');
            let prevPath = path.substring(0, splitIndex);
            let currentDirName = path.substring(splitIndex + 1);

            if (!prevPath) prevPath = "/";
            let existsDir = await fileUtils.existsDirectory(prevPath, currentDirName, owner.id);

            if (!existsDir) return res.status(409).json({ error: true, message: "Path does not exist" });
        }

        const file = await fileUtils.findFile(path, fileName, owner.id);

        if (file.length) {
            return res.status(409).json({ error: true, message: "Trying to create file that already exists." });
        }


        const FileDocument = await fileUtils.createFile({ path, fileName, owner, extension, needsVerification, sharedWith, storageName });
        res.json(FileDocument);

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

const updateFile = async (req, res) => {
    let { fileInfo, extension, storageName } = req.body;

    fileInfo = JSON.parse(fileInfo);

    if(fileInfo.status!=fileConstants.STATUS_TYPES.ACTIVE) {
        return res.status(400).json({error: true, message: ""})
    }

    if (!fileInfo || !storageName) return res.status(400).json({ error: true, message: "Missing required fields" });

    try {
        const result = await fileUtils.changeFileToInactive(fileInfo._id);
        const newFile = await fileUtils.createNewVersionOfFile(fileInfo, storageName);

        res.json(newFile);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: true, message: error });
    }
}


const createDirectory = async (req, res) => {
    let { path, dirName } = req.body;

    let owner = { id: req._user._id, email: req._user.email };
    if (!path) path = '/';

    if (path[0] != "/") path = '/' + path;

    if (!dirName || !owner) return res.status(400).json({ error: true, message: "Missing required fields" });

    try {

        if (path != '/') {
            let splitIndex = path.lastIndexOf('/');
            let prevPath = path.substring(0, splitIndex);
            let currentDirName = path.substring(splitIndex + 1);

            if (!prevPath) prevPath = '/';

            let existsDir = await fileUtils.existsDirectory(prevPath, currentDirName, owner.id);


            if (!existsDir) return res.status(409).json({ error: true, message: "Path does not exist" });
        }

        let existsNewDir = await fileUtils.existsDirectory(path, dirName, owner.id);

        if (existsNewDir) return res.status(409).json({ error: true, message: "Directory already exists" });

        const dirCreated = await fileUtils.createDirectory(path, owner, dirName);

        if (dirCreated) return res.json("Directory successully created");
        return res.status(400).json({ error: true, message: "Unexpected error" });
    } catch (error) {
        return res.status(400).json({ error: true, message: "Unexpected error" });
    }
}

const getFiles = async (req, res) => {
    let { path } = req.query;

    if (!path) path = '/';
    let owner = req._user._id;

    if (path[0] != '/') path = '/' + path;

    try {
        const files = await fileUtils.findFiles(owner, path);
        return res.json(files);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: true, message: "Unexpected Error" })
    }

}

const getVersionsByFile = async (req, res) => {
    let { id } = req.params;

    let user = req._user;

    try {
        let file = await fileUtils.findFileById(id, user._id)

        let files = await fileUtils.findAllVersionsOfFile(file[0].path, file[0].fileName, file[0].owner.id); 

        if(!files) return res.status(500);
        let versions = files.map(file => ({id : file._id, date : file.dateOfCreation, version : file.version, status: file.status, versionWithNumber: 'Version ' + file.version}));
        // versions.sort((a, b) => {b.version - a.version})
        
        return res.status(200).json(versions);

    } catch (error) {
        console.log(error);
        res.status(500).json({ falied: true, message: "Unexpected Error", err: {error} });
    }
}

const getFile = async (req, res) => {
    let { id } = req.params;

    try {
        const file = await fileUtils.findFileById(id, req._user._id)
        if (!file.length) res.status(404).json({ error: true, message: "Could not get access to requested file" })
        res.json(file[0]);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: true, message: "Could not process request." })
    }
}


const getSharedFiles = async (req, res) => {
    let { path } = req.query;
    if (!path) path = '/';
    let user = req._user;
    if (path[0] != '/') path = '/' + path;

    try {
        const files = await fileUtils.findSharedFiles(user, path);
        return res.json(files);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: true, message: "Unexpected Error" })
    }

}

const getPendingFiles = async (req, res) => {
    let { path } = req.query;
    if (!path) path = '/';
    let user = req._user;
    if (path[0] != '/') path = '/' + path;

    try {
        const files = await fileUtils.findPendingFiles(user, path);
        return res.json(files);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: true, message: "Unexpected Error" })
    }

}

const downloadFile = async (req, res) => {
    let { id } = req.params;

    try {
        const file = await fileUtils.findFileById(id, req._user._id);

        if (!file.length) return res.status(404).json({ error: true, message: "Could not get resource." })
        res.attachment(file[0].fileName);

        const fileStream = fileUploadUtils.download(file[0].storageId);
        fileStream.pipe(res);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: true, message: "Could not process request." })
    }
}


const deleteFile = async (req, res) => {
    let { id } = req.params;

    let user = req._user;

    try {
        let file = await fileUtils.findFileById(id, user._id)

        let response = await fileUtils.findAllVersionsFileAndDelete(file[0].path, file[0].fileName, file[0].owner.id); //{files, deleted}
        if(!response) return res.status(500);

        let files = response.files;
        let deleted = response.deleted;

        const aws_keys = files.map(file => ({Key: file.storageId}));

        fileUploadUtils.deleteMany(aws_keys).then(data => {
            return res.status(200).json(data);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ falied: true, message: "Unexpected Error", err: {error} });
    }
}

const deleteDirectory = async (req, res) => {
    const { id } = req.params;

    if (!id) res.status(400).json({ error: true, message: 'Missing directory id' });

    try {
        const isRemoved = await fileUtils.removeDirectory(id);
        if (isRemoved) res.json('Directory successully removed');
        res.status(400).json({ error: true, message: "Something went wrong." })
    } catch (error) {
        res.status(500).json({ error: true, message: "Unable to process request" })
    }
}


const getDirectory = async (req, res) => {
    let { path } = req.query;

    let splitPath = [];

    let dirName = '';
    let newPath = '';

    if (!path) path = '/';

    let user = req._user;

    if (path[0] != '/') path = '/' + path;

    splitPath = path.split('/');

    dirName = splitPath.pop();

    newPath = splitPath.join('/');

    if (newPath[0] != '/') newPath = '/' + newPath;

    try {
        const file = await fileUtils.findDirectory(newPath, dirName, user._id);

        if(file.length == 0) return res.status(404).json(false);
        return res.status(200).json(true);
    } catch (error) {
        console.log(error)
        return res.status(400).json({error: true, message: "Could not process request."})
    }
}

const updateVerificationStatus = async (req, res) =>{
    const {id, status} = req.body;
    if(!id || !status) return res.status(400).json({ error: true, message: "missing fields" });
    try{
        await fileUtils.updateVerificationStatus(id, status);
        res.json("File Verification Status Updated");
    }catch (error){
        res.status(400).json({ error: true, message: "Something went wrong" });
    }
}


module.exports = {
    createFile,
    getFiles,
    createDirectory,
    deleteDirectory,
    updateFile,
    getFile,
    downloadFile,
    getSharedFiles,
    getPendingFiles,
    getDirectory,
    deleteFile,
    updateVerificationStatus,
    getVersionsByFile
}