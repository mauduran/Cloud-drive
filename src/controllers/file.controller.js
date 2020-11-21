const fileUtils = require('../utils/file.utils');

const createFile = async (req, res) => {

    let { path, fileName, extension, needsVerification, sharedWith, storageName } = req.body;

    let owner = req._user._id;
    sharedWith = JSON.parse(sharedWith).map(user => {
        return { userId: user.id, permission: user.permission }
    });
    console.log(storageName);
    if (!path) path = '/';

    if (!fileName || !owner || !extension || !needsVerification || !storageName) return res.status(400).json({ error: true, message: "Missing required fields" });


    try {
        const existsDirectory = await fileUtils.existsDirectory(path, owner);

        if (path != "/" && !existsDirectory) return res.status(400).json({ error: true, message: "Path does not exist." })
        const file = await fileUtils.findFile(path, fileName, owner);

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


const createDirectory = async (req, res) => {
    let { path, directoryName, owner } = req.body;

    if (!path) path = '/';

    if (path[0] != "/") path = '/' + path;

    if (!directoryName || !owner) return res.status(400).json({ error: true, message: "Missing required fields" });

    try {

        if (path != '/') {
            let existsDir = await fileUtils.existsDirectory(path, owner);

            if (!existsDir) return res.status(409).json({ error: true, message: "Path does not exist" });
        }

        let newPath = path + "/" + directoryName;

        let existsNewDir = await fileUtils.existsDirectory(newPath, owner);

        if (existsNewDir) return res.status(409).json({ error: true, message: "Directory already exists" });

        const dirCreated = await fileUtils.createDirectory(path, owner, directoryName);
        if (dirCreated) return res.json("Directory successully created");
        return res.status(400).json({ error: true, message: "Unexpected error" });
    } catch (error) {
        return res.status(400).json({ error: true, message: "Unexpected error" });
    }
}


const getFiles = async (req, res) => {
    let { path } = req.query;

    if (path) path = '/';
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

const deleteFile = async (req, res) => {
    const { id } = req.params;

    if (!id) res.status(400).json({ error: true, message: 'Missing file id' });
    // This should be substituted with auth middleware
    // if(!owner) return res.status(400).json({error: true, message: "Missing required fields"});

    try {
        fileUtils.removeFile(id);
        res.json("File successfully removed");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Unexpected Error" });
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

const updateFile = async (req, res) => {
    let { path, fileName, owner } = req.body;
    //Middleware?
    if (!path) path = '/';

    if (!fileName || !owner) return res.status(400).json({ error: true, message: "Missing required fields" });

    try {

        if (path != "/") {
            const existsDirectory = await fileUtils.existsDirectory(path, owner);
            if (!existsDirectory) return res.status(400).json({ error: true, message: "Path does not exist." })

        }

        const file = await fileUtils.findFile(path, fileName, owner);

        if (file.length) {
            await fileUtils.removeFile(file[0]._id);
        }

        const FileDocument = await fileUtils.createFile(path, fileName, owner);
        res.json(FileDocument);

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

module.exports = {
    createFile,
    getFiles,
    createDirectory,
    deleteFile,
    deleteDirectory,
    updateFile
}