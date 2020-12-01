const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middlewares/auth.middleware");
const fileUpload = require('../utils/file-upload.utils')
const s3uploadImage = fileUpload.uploadImage.single('file');


const router = express.Router();

/**
 * @swagger
 * /api/users:
 *  get:
 *    description: Get list of all users
 *    tags: [Users]
 *    parameters:
 *      - in: query
 *        name: searchInput
 *        description: Search input for email of user
 *        required: false
 *        schema:
 *          type: String
 *          example: Anají 
 *    responses: 
 *      "200":
 *        description: array of users
 *      "404": 
 *          description: No users found
 *      "500":
 *        description: Unexpected error. 
 *  delete:
 *    description: Delete user
 *    tags: [Users]
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
 *        description: Deleted
 *      "500":
 *        description: Could not process request. 
 */
router.route('/')
    .get(authMiddleware, userController.getUsers)
    .delete(authMiddleware, userController.deleteUser);
    // .put(userController.updateUser)

/**
 * @swagger
 * /api/users/login:              
 *  post:
 *    description: Login into account
 *    tags: [Users]
 *    requestBody:
 *      description: Login credentials
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: 
 *              - email
 *              - password
 *            properties:
 *              email:
 *                description: Account email
 *                type: string
 *                example: admin@cloudrive.com
 *              password:
 *                description: Password
 *                type: string
 *                example: password                
 *    responses: 
 *      "200":
 *        description: Login successful.
 *      "400":
 *        description: Missing required fields
 *      "404":
 *        description: User not found!
 *      "500":
 *          description: Unexpected error
 */

router.route('/login')
    .post(userController.login)

/**
 * @swagger
 * /api/users/login/google:              
 *  post:
 *    description: Login into account
 *    tags: [Users]
 *    requestBody:
 *      description: Login credentials
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: 
 *              - id
 *            properties:
 *              id:
 *                description: idToken
 *                type: string
 *                example: XYZ123
 *    responses: 
 *      "201":
 *        description: Login successful.
 *      "400":
 *        description: Could not login with google"
 *      "500":
 *          description: Unexpected error!
 */

router.route('/login/google')
    .post(userController.googleLogin)

/**
 * @swagger
 * /api/users/logout:              
 *  post:
 *    description: Logout my session
 *    tags: [Users]
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
 *        description: Login successful.
 *      "400":
 *        description: Could not login with google"
 *      "500":
 *          description: Unexpected error!
 */
router.route('/logout')
    .post(authMiddleware, userController.logOut);
/**
 * @swagger
 * /api/users/register:              
 *  post:
 *    description: Create an account.
 *    tags: [Users]
 *    requestBody:
 *      description: Sign Up information
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: 
 *              - name
 *              - email
 *              - password
 *            properties:
 *              name:
 *                type: string
 *                example: Mauricio
 *              email:
 *                type: string
 *                example: test2@a.com
 *              password:
 *                type: string
 *                example: password    
 *    responses: 
 *      "201":
 *        description: User was successfully registered.
 *      "409":
 *        description: User already exists.
 *      "400":
 *        description: Missing fields.
 *      "500":
 *          description: Unexpected error
 */

router.route('/register')
    .post(userController.createUser);

/**
 * @swagger
 * /api/users/changePassword:
 *  put:
 *    description: Update account password. Requires authorization
 *    tags: [Users]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true
 *    requestBody:
 *      description: Old passwrod and new password
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - currentPassword
 *              - newPassword
 *            properties:
 *              email:
 *                type: String
 *                description: Email to change password
 *                example: t@tgmail.com   
 *              currentPassword:
 *                type: String
 *                description: Current Password
 *                example: password   
 *              newPassword:
 *                type: string
 *                description: New account password
 *                example: newPass            
 *    responses: 
 *      "200":
 *        description: Password Change Successful!
 *      "400":
 *        description: Invalid request entered.
 *      "404": 
 *        description: User not found!
 */
router.route('/changePassword')
    .post(authMiddleware, userController.changePassword);

/**
 * @swagger
 * /api/users/delete:
 *  delete:
 *    description: Delete user
 *    tags: [Users]
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
 *        description: Deleted
 *      "500":
 *        description: Could not process request. 
 */ 

router.route('/delete')
    .delete(authMiddleware, userController.deleteUser);


/**
 * @swagger
 * /api/users/changeName:
 *  post:
 *    description: Update account username. Requires authorization
 *    tags: [Users]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true
 *    requestBody:
 *      description: New username
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - newName
 *            properties:
 *              newName:
 *                type: String
 *                description: Email to change password
 *                example: Mauricio Durán          
 *    responses: 
 *      "200":
 *        description: Name changed successfully!
 *      "400":
 *        description: Invalid request entered.
 *      "404": 
 *        description: User not found!
 */

router.route('/delete')
    .delete(authMiddleware, userController.deleteUser);

router.route('/changeName')
    .put(authMiddleware, userController.changeName);


// router.route('/getUser')
//     .post(authMiddleware, userController.getUser);

    
/**
 * @swagger
 * /api/users/getProfileInfo:
 *  get:
 *    description: Get user info with token
 *    tags: [Users] 
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true
 *    security: 
 *      ApiKeyAuth: []
 *    responses: 
 *      "200":
 *        description: User found!
 *      "404": 
 *        description: Could not get user profile
 */
router.route('/getProfileInfo')
    .get(authMiddleware, userController.getProfileInfo)

/**
 * @swagger
 * /api/users/notifications:
 *  get:
 *    description: Get user notifications
 *    tags: [Users]
 *    responses: 
 *      "200":
 *        description: User found!
 *      "404": 
 *        description: Could not get user profile
 */

router.route('/notifications')
    .get(authMiddleware, userController.getNotifications)
    .delete(authMiddleware, userController.deleteAllNotifications);


/**
 * @swagger
 * /api/users/notifications/:id:
 *  delete:
 *    description: Delete a user notification by id notification
 *    tags: [Users]
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        description: User token
 *        schema:
 *          type: string
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlwYW5jaGl0b0BpdGVzby5teCIsImlhdCI6MTYwNjU0NTIzMn0.r-7mMWw6lLByTfcJcKOofd8KUnFbQaATjn8i0XOm2t4 
 *        required: true    
 *    requestBody:
 *      description: notification id
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
 *                description: notification id 
 *                example: 5fb89e5fd6ae52013858274b    
 *    responses: 
 *      "200":
 *        description: "true"
 *      "400": 
 *        description: Missing notification ID
 */    
router.route('/notifications/:id')
    .delete(authMiddleware, userController.deleteNotification);

/**
 * @swagger
 * /api/users/profile-pic:
 *  put:
 *    description: Update a user photo on DB and S3 Bucket
 *    tags: [Users]
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
 *        description: "true"
 *      "400": 
 *        description: Missing notification ID
 */    

router.route('/profile-pic')
.put(authMiddleware, s3uploadImage, userController.updateUserProfilePic)

router.route('/:id')
    .get(authMiddleware, userController.getUser)

module.exports = router;

