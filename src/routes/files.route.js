const express = require('express');
const fileController = require('../controllers/file.controller');

const router = express.Router();

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

