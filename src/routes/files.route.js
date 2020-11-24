const express = require('express');
const fileController = require('../controllers/file.controller');
const fileUpload = require('../utils/file-upload.utils')
const router = express.Router();
const s3upload = fileUpload.upload.single('file');
const auth = require('../middlewares/auth.middleware');

router.route('/')
.post(auth, s3upload, fileController.createFile)
.get(auth, fileController.getFiles)
.put(fileController.updateFile);

router.route('/directory')
.post(auth, fileController.createDirectory);

router.route('/directory/:id')
.delete(fileController.deleteDirectory)

router.route('/download/:id')
.get(auth, fileController.downloadFile);

router.route('/sharedFiles')
.get(auth, fileController.getSharedFiles)

router.route('/pendingFiles')
.get(auth, fileController.getPendingFiles)

router.route('/existDirectory')
.get(auth, fileController.getDirectory)

router.route('/:id')
.get(auth, fileController.getFile)
    .delete(fileController.deleteFile);


module.exports = router;

