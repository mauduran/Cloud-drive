const mongoose = require('../../config/db-connection');
const UserSchema = require('../models/user.model');
const TokenSchema = require('../models/tokens.model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userUtils = require('../utils/user.utils');
const fileUtils = require('../utils/file.utils');
const fileUploadUtils = require('../utils/file-upload.utils');
const notificationUtils = require('../utils/notification.utils');
require('dotenv').config();

const {
    OAuth2Client
} = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

let createUser = function (req, res) {
    let {
        name,
        password,
        email
    } = req.body;

    if (!name || !email || !password) return res.status(400).json({
        error: true,
        message: "Missing required fields"
    });

    email = email.toLowerCase();

    let hash = bcrypt.hashSync(password, 10);

    let newUser = {
        name,
        hash,
        email,
        joined: Date.now(),
        lastConnection: Date.now(),
        sharedWithMe: []
    }
    let userNew = UserSchema(newUser);
    userNew.save((err) => {
        if (err) {
            return res.status(409).json("User already exists!")
        } else {
            return res.status(201).json("User created!");
        }
    });

}


let login = function (req, res) {
    let {
        email,
        password
    } = req.body;

    if (!password || !email) return res.status(400).json({
        error: true,
        message: "Missing required fields"
    });

    UserSchema.findOne({
        email
    })
        .then(user => {
            if (user) {
                const validCredentials = bcrypt.compareSync(password, user.hash);

                if (!validCredentials) return res.status(400).json({
                    error: true,
                    message: "Invalid credentials"
                })
                const token = signToken(email);
                const tokenObject = {
                    userId: user._id,
                    token
                }
                let tokenNew = TokenSchema(tokenObject);
                tokenNew.save((err) => {
                    if (err) {
                        return res.status(401).json("Unexpected Error!")
                    } else {
                        return res.json(tokenObject);
                    }
                })
            } else {
                res.status(404).json({
                    error: true,
                    message: 'User not found!'
                });
            }
        })
        .catch(err => {
            console.log(err);
            //res.status(500).send({message : 'Server error.', error : `${err}`});
            res.status(400).json(error);

        })
}

let logOut = async function (req, res) {
    let token = req.headers.authorization;
    try {
        await TokenSchema.deleteOne({ token })
        res.json({ error: false, message: "Logout successful" });
    } catch (error) {
        res.status(400).json({ error: true, message: "Token did not exist" })
    }

}

let deleteUser = async (req, res) => {
    const userId = req._user._id;

    try {
        await UserSchema.findByIdAndDelete(userId);
        const content = await fileUtils.findAllFiles(userId);
        const awsKeys = content.files.map(file => ({Key: file.storageId}));
        await fileUtils.removeUserContent(userId);
        await fileUploadUtils.deleteMany(awsKeys);
        await fileUtils.removeUserFromSharedFile(userId);
        return res.status(200).json("Deleted");
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: true, message: "Could not process request"});
    }
}

let googleLogin = function (req, res) {
    const id = req.body.id;
    if(!id) res.status(400).json({error: true, message: "missing id"})
    googleClient.verifyIdToken({
        idToken: id
    })
        .then(googleResponse => {
            const responseData = googleResponse.getPayload();
            const email = responseData.email;
            return UserSchema.findOne({
                email
            })
        })
        .then(user => {
            if (user) {
                if (!user.googleId) {
                    return UserSchema.findOneAndUpdate({
                        email
                    }, {
                        $set: {
                            googleId: id
                        }
                    })
                }
                return Promise.resolve(user)
            } else {
                let newUser = {
                    name: `${responseData.given_name} ${responseData.family_name}`,
                    googleId: id,
                    email,
                    joined: Date.now(),
                    lastConnection: Date.now(),
                    sharedWithMe: []
                }
                let userNew = UserSchema(newUser);
                return userNew.save()
            }
        })
        .then(user => {
            const token = signToken(user.email);
            const tokenObject = {
                userId: user._id,
                token
            }

            let tokenNew = TokenSchema(tokenObject);
            tokenNew.save((err) => {
                if (err) {
                    console.log(err)
                    return res.status(401).json("Unexpected Error!")
                } else {
                    return res.json(tokenObject);
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(400).json({
                error: true,
                message: "Could not login with google"
            })
        })
}

let changePassword = function (req, res) {
    let {
        oldPassword,
        newPassword
    } = req.body;

    UserSchema.findById(req._user._id)
        .then(user => {
            if (user) {
                const validCredentials = bcrypt.compareSync(oldPassword, user.hash);

                if (!validCredentials) return res.status(400).json({
                    error: true,
                    message: "Invalid credentials"
                })

                let hash = bcrypt.hashSync(newPassword, 10);
                UserSchema.findByIdAndUpdate(req._user._id, {
                    $set: {
                        hash: hash
                    }
                }).then(res.status(200).json({
                    message: "Password Change Successful!"
                }));


            } else {
                res.status(404).json({
                    message: 'User not found!'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        })
}

let getProfileInfo = function (req, res) {
    if (!req._user) res.status(404).json({ error: true, message: "Could not get user profile" });
    let info = {
        name: req._user.name,
        email: req._user.email,
        img: req._user.imageUrl,
        joined: req._user.joined
    }
    res.json({ user: info, message: "User found" })
}

let getUsers = function (req, res) {
    let searchInput = req.query.q || '';
    searchInput = searchInput.toLowerCase();
    UserSchema.find({
        email: {
            $regex: `^${searchInput}.*`
        }
    })
        .then(users => {
            return res.json({
                results: users.filter(user => user.email != req._user.email).map(user => (
                    {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        joined: user.joined,
                        imageUrl: user.imageUrl,
                        lastConnection: user.lastConnection
                    }
                )),
                size: users.length
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                error: true,
                message: "Unable to process request"
            });
        })
}

let getUser = function (req, res) {
    let id = req.params.id;
    if (!id) return res.status(400).json({
        error: true,
        message: "Missing required fields"
    });

    UserSchema.findOne({
        _id: id
    })
        .then(user => {
            if (user) {
                let info = {
                    name: user.name,
                    email: user.email,
                    img: user.imageUrl,
                    joined: user.joined
                }
                res.status(200).json({
                    user: info,
                    message: "User found!"
                })
            } else {
                res.status(404).json({
                    message: "User not found!"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        })
}

let changeName = function (req, res) {
    let newName = req.body.newName;
    let owner = req._user._id;

    if(!newName){
        res.status(400).json({error: true, message: "Missing fields"})
    }
    UserSchema.findById(owner)
        .then(user => {
            if (user) {
                UserSchema.findOneAndUpdate({
                    email: user.email
                }, {
                    $set: {
                        name: newName
                    }
                }).then(res.status(200).json({ message: "Name changed successfully!" }));
            } else {
                res.status(404).json({
                    error: true,
                    message: "User not found!"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
}


const updateUserProfilePic = async (req, res) => {
    let { fileName, storageName } = req.body;
    let owner = { id: req._user._id};
    let loc = req.file.location;
    
    if (!fileName || !storageName || !owner) return res.status(400).json({ error: true, message: "Missing required fields" });

    try {
        const result = await userUtils.updateUserProfilePicId(owner.id, loc);
        
        return res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: true, message: error });
    }
}

const getNotifications = (req, res) => {
    res.json(req._user.notifications);
}

const deleteNotification = async (req, res)=> {
    let _userId= req._user._id;
    let {id} = req.params;
    if(!id) return res.status(400).json({ error: true, message: "Missing notification ID" });
    try {
        const result = await notificationUtils.deleteNotification(_userId, id);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: true, message: error });
    }
}


const deleteAllNotifications = async (req, res)=> {
    let id = req._user._id;
    try {
        const result = await notificationUtils.deleteAllNotifications(id);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: true, message: error });
    }
}


let signToken = function (email) {
    return jwt.sign({
        email
    }, process.env.TOKEN_SECRET);
}

module.exports = {
    createUser,
    getUser,
    getUsers,
    deleteUser,
    login,
    googleLogin,
    changePassword,
    changeName,
    getProfileInfo,
    logOut,
    updateUserProfilePic,
    getNotifications,
    deleteNotification,
    deleteAllNotifications
}