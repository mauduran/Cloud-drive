const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middlewares/auth.middleware");

var multer  = require('multer')
var upload = multer();


const router = express.Router();

/**
 * @swagger
 * /users:
 *  get:
 *    description: Get list of all competitors
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
 */
router.route('/')
    .get(userController.getUsers);

router.route("/test")
    .post(upload.single('file'), (req, res) => {
        console.log(req.body);
        console.log(req.file);

        res.json("al cien")
    })
// router.route('/getUser')
//     .get(userController.getUser);

/**
 * @swagger
 * /users/login:              
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
 *              - pwd
 *            properties:
 *              email:
 *                description: Account email
 *                type: string
 *                example: rifas@cloud.com
 *              pwd:
 *                description: Password
 *                type: string
 *                example: password                
 *    responses: 
 *      "201":
 *        description: Login successful.
 *      "404":
 *        description: User does not exist.
 *      "400":
 *        description: There is something invalid on the request
 *      "500":
 *          description: Unexpected error
 */

router.route('/login')
    .post(userController.login)

router.route('/login/google')
    .post(userController.googleLogin)
/**
 * @swagger
 * /users/register:              
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
 *              - pwd
 *            properties:
 *              name:
 *                type: string
 *                example: Mauricio
 *              email:
 *                type: string
 *                example: a@a.com
 *              pwd:
 *                type: string
 *                example: password
 *                  
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
 * /changePassword:
 *  put:
 *    description: Update account password. Requires authorization
 *    tags: [Users]
 *    requestBody:
 *      description: Old passwrod and new password
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - currentPassword
 *              - newPassword
 *            properties:
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
 *        description: Password changed
 *      "400":
 *        description: Invalid request entered.
 *      "404": 
 *        description: Not found
 */
router.route('/changePassword')
    .post(userController.changePassword);

/**
 * @swagger
 * /users/{id}:
 *  get:
 *    description: Get user information
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        description: Id of user to get info of.
 *        required: true
 *        example: 123
 *    responses: 
 *      "200":
 *        description: User Object
 *      "400":
 *        description: Invalid id entered
 *      "404": 
 *        description: Id of user does not match any existing user.
 *  delete:
 *    description: Delete user given its id
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        description: Id of user to delete
 *        required: true
 *        example: 123
 *    responses: 
 *      "200":
 *        description: OK
 *      "400":
 *        description: Invalid id entered
 *      "404": 
 *        description: Id of user does not match any existing user.
 * 
 *  put:
 *    description: Update cross given its id. Allows to change principal, principal part number, if it is direct and add comments
 *    tags: [Users]
 *    requestBody:
 *      description: Login credentials
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required: 
 *              - name
 *            properties:
 *              name:
 *                description: Name of user
 *                type: string
 *                example: Edgar       
 *    responses: 
 *      "200":
 *        description: User updated
 *      "400":
 *        description: Invalid request entered.
 *      "404": 
 *        description: Could not find user by that id
 */

/*
router.route('/:id')
    .get(userController.getUser)
    .put(userController.updateUser)
    .delete(userController.deleteUser);
*/

router.route('/update')
    .post(userController.updateUser);

router.route('/delete')
    .delete(userController.deleteUser);

router.route('/changeName')
    .post(authMiddleware, userController.changeName);


router.route('/getUser')
    .post(userController.getUser);

module.exports = router;

