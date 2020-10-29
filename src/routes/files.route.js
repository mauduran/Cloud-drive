const express = require('express');
const fileController = require('../controllers/file.controller');

const router = express.Router();

router.route('/')
    .post(fileController.createFile);

router.route('/:path')
    .get(fileController.getFiles)

module.exports = router;

