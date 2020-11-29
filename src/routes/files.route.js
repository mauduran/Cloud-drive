const express = require('express');
const fileController = require('../controllers/file.controller');
const fileUpload = require('../utils/file-upload.utils')
const router = express.Router();
const s3upload = fileUpload.upload.single('file');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /files:
 *  post:
 *    description: Upload a file to DB and S3 Bucket
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true      
 *    responses: 
 *      "201":
 *        description: file
 *      "400": 
 *        description: Missing required fields
 *      "409": 
 *        description: Trying to create file that already exists.
 *  get:
 *    description: Get files by user
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true    
 *    responses: 
 *      "200":
 *        description: Array of files
 *      "400": 
 *        description: Unexpected Error
 *  put:
 *    description: Update file with new content
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true    
 *    responses: 
 *      "200":
 *        description: new file
 *      "400": 
 *        description: Missing required fields
 */    
router.route('/')
.post(auth, s3upload, fileController.createFile)
.get(auth, fileController.getFiles)
.put(auth, s3upload, fileController.updateFile);


/**
 * @swagger
 * /files/directory:
 *  post:
 *    description: Upload a file to DB and S3 Bucket
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true      
 *    requestBody:
 *      description: Path where dir will be created, and dirName for new dir.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - path
 *              - dirName
 *            properties:
 *              path:
 *                type: String
 *                description: Destination from root 
 *                example: '/test'    
 *              dirName:
 *                type: String
 *                description: Name of new folder 
 *                example: test2    
 *    responses: 
 *      "201":
 *        description: Directory successully created
 *      "400": 
 *        description: Missing required fields
 *      "409": 
 *        description: Directory already exists
 */    
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

