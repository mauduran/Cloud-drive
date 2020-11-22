const express = require('express');
const fileController = require('../controllers/file.controller');
const fileUpload = require('../utils/file-upload.utils')
const router = express.Router();
const s3upload = fileUpload.upload.single('file');
const auth = require('../middlewares/auth.middleware');

router.route('/test')
    .post((req, res) => {
        s3upload(req, res, (err) => {
            if (err) return res.status(401).json(err);
            console.log(req.body);
            return res.json( 'al cien' );
        })
    })
    .get((req, res) => {
        res.attachment("About-me.docx");
        const fileStream = fileUpload.download('About-me1604348109594.docx');

        fileStream.pipe(res);
    })
router.route('/')
    .post(auth, s3upload, fileController.createFile)
    .get(auth, fileController.getFiles)
    .put(fileController.updateFile);

router.route('/:id')
    .delete(fileController.deleteFile);


router.route('/directory')
    .post(auth, fileController.createDirectory);

router.route('/directory/:id')
    .delete(fileController.deleteDirectory)

router.route('/get/:path')
    .get(fileController.getFiles)
module.exports = router;

