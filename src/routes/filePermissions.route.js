const express = require('express');
const filePermissionController = require('../controllers/filePermissionController');

const router = express.Router();

router.route('/')
    .post(filePermissionController.createFilePermission)


router.route('/:id')
    .get(filePermissionController.getFilePermissions)
    .update(filePermissionController.updateFilePermissions)
    .delete(filePermissionController.deleteFilePermission);
    
module.exports = router;

