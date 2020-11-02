const express = require('express');
const filePermissionController = require('../controllers/filePermission.controller');


const router = express.Router();

router.route('/')
    .post(filePermissionController.createFilePermission)


router.route('/:id')
    .get(filePermissionController.getFilePermissions)
    .put(filePermissionController.updateFilePermissions)
    .delete(filePermissionController.deleteFilePermission);

module.exports = router;

