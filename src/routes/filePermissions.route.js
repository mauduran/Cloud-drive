const express = require('express');
const filePermissionController = require('../controllers/filePermission.controller');


const router = express.Router();

/**
 * @swagger
 * /api/filePermissions:
 *  post:
 *    description:  Adds a permission on a file for a user
 *    tags: [File permissions]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true      
 *    requestBody:
 *      description: FileId of the file, email of the user and type of permission
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - fileId
 *              - email
 *              - permission
 *            properties:
 *              fileId:
 *                type: String
 *                description: Id of the file to which the permission will be added
 *                example: '5fbade24a7cf7e768ce1bc53'    
 *              email:
 *                type: String
 *                description: Id of the user to which the permission will granted
 *                example: 'example@iteso.mx'
 *              permission:
 *                type: String
 *                description: Type of permission
 *                example: 'Read'
 *    responses: 
 *      "201":
 *        description: Succesfully added file permission
 *      "400": 
 *        description: Missing required fields
 */ 
router.route('/')
    .post(filePermissionController.createFilePermission)

/**
 * @swagger
 * /api/filePermissions/:id:
 * 
 *  get:
 *    description: Get list of all file permisions
 *    tags: [File permissions]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true 
 * 
 *      - in: path
 *        name: fileID
 *        description: Id of the file
 *        required: true
 *        schema:
 *          type: String
 *          example: 5fbade24a7cf7e768ce1bc53
 * 
 *    responses: 
 *      "200":
 *        description: OK
 *      "404": 
 *          description: Missing file ID
 * 
 *  put:
 *    description: Update a permission
 *    tags: [File permissions]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true 
 * 
 *      - in: path
 *        name: fileID
 *        description: Id of the file
 *        required: true
 *        schema:
 *          type: String
 *          example: 5fbade24a7cf7e768ce1bc53
  *    requestBody:
 *      description: FileId of the file, email of the user and type of permission
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - permission
 *            properties:  
 *              permission:
 *                type: String
 *                description: Type of permission
 *                example: 'Read'
 *    responses: 
 *      "200":
 *        description: OK
 *      "404": 
 *          description: Missing file ID
 *  delete:
 *    description: Delete a permission
 *    tags: [File permissions]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true 
 * 
 *      - in: path
 *        name: fileID
 *        description: Id of the file
 *        required: true
 *        schema:
 *          type: String
 *          example: 5fbade24a7cf7e768ce1bc53
 *    responses: 
 *      "200":
 *        description: OK
 *      "404": 
 *          description: Missing file ID
 * 
 */
router.route('/:id')
    .get(filePermissionController.getFilePermissions)
    .put(filePermissionController.updateFilePermissions)
    .delete(filePermissionController.deleteFilePermission);

module.exports = router;

