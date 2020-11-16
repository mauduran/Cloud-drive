const express = require('express');
const fileController = require('../controllers/file.controller');
const fileUpload = require('../utils/file-upload.utils')
const router = express.Router();
const fs = require('fs');
const singleUpload = fileUpload.upload.single('file');

router.route('/test')
    .post((req, res) => {
        singleUpload(req, res, (err) => {
            if (err) return res.status(401).json(err);
            return res.json({ 'imageUrl': req.file.location });
        })
    })
    .get((req, res) => {
        res.attachment("About-me.docx");
        const fileStream = fileUpload.download('About-me1604348109594.docx');

        fileStream.pipe(res);
    })
router.route('/')
    .post(fileController.createFile)
    .get(fileController.getFiles)
    .put(fileController.updateFile);

router.route('/:id')
    .delete(fileController.deleteFile);


router.route('/directory')
    .post(fileController.createDirectory);

router.route('/directory/:id')
    .delete(fileController.deleteDirectory)

router.route('/get/:path')
    .get(fileController.getFiles)
module.exports = router;

