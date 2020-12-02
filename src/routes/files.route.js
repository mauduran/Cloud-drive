const express = require('express');
const fileController = require('../controllers/file.controller');
const fileUpload = require('../utils/file-upload.utils')
const router = express.Router();
const s3upload = fileUpload.upload.single('file');
const auth = require('../middlewares/auth.middleware');
const FileSchema = require('../models/file.model');

/**
 * @swagger
 * /api/files:
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
 * /api/files/directory:
 *  post:
 *    description: Make new folder
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


/**
 * @swagger
 * /api/files/download/:id :
 *  get:
 *    description: Download file by id
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
 *              - id
 *            properties:
 *              id:
 *                type: String
 *                description: file id 
 *                example: 5fbade24a7cf7e268ce1bc53     
 *    responses: 
 *      "200":
 *        description: file
 *      "400": 
 *        description: Missing required fields
 *      "404": 
 *        description: Could not get resource
 */

router.route('/download/:id')
.get(auth, fileController.downloadFile);


/**
 * @swagger
 * /api/files/sharedFiles :
 *  get:
 *    description: Get all shared with me files
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
 *        description: Object with array of sharedWithMe files like attribute
 *      "401": 
 *        description: Invalid Token!
 */
router.route('/sharedFiles')
.get(auth, fileController.getSharedFiles)


/**
 * @swagger
 * /api/files/pendingFiles :
 *  get:
 *    description: Get all pending files to verify
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
 *        description: Object with array of pending files like attribute
 *      "401": 
 *        description: Invalid Token!
 */
router.route('/pendingFiles')
.get(auth, fileController.getPendingFiles)


/**
 * @swagger
 * /api/files/existDirectory :
 *  get:
 *    description: Know if a directory exists to move later
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true      
 *      - in: query
 *        name: Path
 *        description: Path from root
 *        schema:
 *          type: string
 *          example: "/test/test-inside"
 *        required: true      
 *    responses: 
 *      "200":
 *        description: "true"
 *      "400":
 *        description: Could not process request.
 *      "401": 
 *        description: Invalid Token!
 *      "404": 
 *        description: "false"
 */

router.route('/existDirectory')
.get(auth, fileController.getDirectory)

/**
 * @swagger
 * /api/files/deleteFile/:id :
 *  delete:
 *    description: Delete file by fileId
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true      
 *      - in: path
 *        name: id
 *        description: fileId
 *        schema:
 *          type: string
 *          example: 5fc425ac8212670ca4dee25f
 *        required: true      
 *    responses: 
 *      "200":
 *        description: "true"
 *      "400":
 *        description: Could not process request.
 *      "401": 
 *        description: Invalid Token!
 *      "404": 
 *        description: "false"
 */
router.route('/deleteFile/:id')
.delete(auth, fileController.deleteFile)


/**
 * @swagger
 * /api/files/updateVerificationStatus :
 *  post:
 *    description: Update verification status of file
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
 *      description: Id and status of file
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - id
 *              - status
 *            properties:
 *              id:
 *                type: String
 *                description: fileId
 *                example: "5fc425ac8212670ca4dee25f"
 *              status:
 *                type: String
 *                description: New status
 *                example: "Verified"      
 *    responses: 
 *      "200":
 *        description: File Verification Status Updated
 *      "400":
 *        description: missing fields
 *      "401": 
 *        description: Invalid Token!
 */
router.route('/updateVerificationStatus')
.post(fileController.updateVerificationStatus);


/**
 * @swagger
 * /api/files/getVersions/:id :
 *  get:
 *    description: Get all versions of file by id
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true 
 *      - in: path
 *        name: id
 *        description: fileId
 *        schema:
 *          type: string
 *          example: 5fc425ac8212670ca4dee25f
 *        required: true        
 *    responses: 
 *      "200":
 *        description: Object with array with all versions of file
 *      "401": 
 *        description: Invalid Token!
 *      "500": 
 *        description: Unexpected Error
 */
router.route('/getVersions/:id')
.get(auth, fileController.getVersionsByFile);


/**
 * @swagger
 * /api/files/:id :
 *  post:
 *    description: Get all versions of file by id
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true 
 *      - in: path
 *        name: id
 *        description: fileId
 *        schema:
 *          type: string
 *          example: 5fc425ac8212670ca4dee25f
 *        required: true        
 *    responses: 
 *      "200":
 *        description: Object with array with all versions of file
 *      "400": 
 *        description: Could not process request.
 *      "401": 
 *        description: Invalid Token!
 *      "404": 
 *        description: Could not get access to requested file
 *  delete:
 *    description: Delete file by fileId
 *    tags: [Files]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true      
 *      - in: path
 *        name: id
 *        description: fileId
 *        schema:
 *          type: string
 *          example: 5fc425ac8212670ca4dee25f
 *        required: true      
 *    responses: 
 *      "200":
 *        description: "true"
 *      "400":
 *        description: Could not process request.
 *      "401": 
 *        description: Invalid Token!
 *      "404": 
 *        description: "false"
 */
router.route('/:id')
.get(auth, fileController.getFile)
.delete(fileController.deleteFile);


module.exports = router;

