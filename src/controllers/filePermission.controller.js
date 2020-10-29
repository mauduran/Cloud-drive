const filePermissionUtils = require('../utils/filePermission.utils');

const createFilePermission = async (req, res) => {
    const { fileId, email, permission } = req.body;

    if (!fileId || !email || !permission) return res.status(400).json({ error: true, message: "missing fields" });
    try {
        await filePermissionUtils.addFilePermission(fileId, email, permission);
        res.status(201).json("Succesfully added file permission");
    } catch (error) {
        res.status(400).json({ error: true, message: "Something went wrong" });
    }

}

const deleteFilePermission = async (req, res) => {
    const {id} = req.params;
    if(!id) return res.status(400).json({ error: true, message: "missing fields" });

    try {
        await filePermissionUtils.removeFilePermission(id);
        res.json("OK");
    } catch (error) {
        res.status(400).json({ error: true, message: "Something went wrong" });
    }
}

const getFilePermissions = (req, res) => {
    const {id} = req.params;
    if(!id) return res.status(400).json({ error: true, message: "missing fields" });
    try {
        await filePermissionUtils.findFilePermissions(id);
        res.json("OK");
    } catch (error) {
        res.status(400).json({ error: true, message: "Something went wrong" });
    }
}

const updateFilePermissions = (req, res) => {
    const {id} = req.params;
    const {permission} = req.body;

    if(!id || !permission) return res.status(400).json({ error: true, message: "missing fields" });

    try {
        await filePermissionUtils.updateFilePermissions(id, permission);
        res.json("OK");
    } catch (error) {
        res.status(400).json({ error: true, message: "Something went wrong" });
    }
}


module.exports = {
    createFilePermission,
    deleteFilePermission,
    getFilePermissions,
    updateFilePermissions
}