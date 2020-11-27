const express = require('express');
const fileController = require('../controllers/file.controller');
const fileUpload = require('../utils/file-upload.utils')
const router = express.Router();
const s3upload = fileUpload.upload.single('file');
const auth = require('../middlewares/auth.middleware');

router.route('/')
.post(auth, s3upload, fileController.createFile)
.get(auth, fileController.getFiles)
.put(auth, s3upload, fileController.updateFile);

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

router.route('/deleteFile/:id')
.delete(auth, fileController.deleteFile)

router.route('/updateVerificationStatus')
.post(fileController.updateVerificationStatus);

router.route('/getVersions/:id')
.get(auth, fileController.getVersionsByFile);

router.route('/test')
    .post((req, res) => {
        s3upload(req, res, (err) => {
            if (err) return res.status(401).json(err);
            return res.json('al cien');
        })
    })
    .get((req, res) => {
        res.attachment("Academic_Ivory_Israel_Arlina_5652.pdf");
        const fileStream = fileUpload.download('Academic_Ivory_Israel_Arlina_5652.pdf');

        fileStream.pipe(res);
    })

router.route('/:id')
.get(auth, fileController.getFile)
.delete(fileController.deleteFile);


module.exports = router;

