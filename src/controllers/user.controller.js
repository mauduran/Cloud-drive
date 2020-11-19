const mongoose = require('../../config/db-connection');
const UserSchema = require('../models/user.model');
const TokenSchema = require('../models/tokens.model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

let getUsers = function (req, res) {
    let searchInput = req.query.q || '';
    searchInput = searchInput.toLowerCase();
    UserSchema.find({ email: { $regex: `^${searchInput}.*` } })
        .then(users => {
            return res.json({
                results: users.map(user => (
                    {
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
            res.status(400).json({ error: true, message: "Unable to process request" });
        })
}

let updateUser = function (req, res) {
    let {
        name,
        email,
        imageUrl
    } = req.body;

    if (!email) return res.status(400).json({
        error: true,
        message: "Missing required fields"
    });

    let changes = {}

    if (name) changes.name = name;
    if (imageUrl) changes.imageUrl = imageUrl;


    UserSchema.findOne({
        email
    })
        .then(user => {
            if (user) {
                UserSchema.findOneAndUpdate({
                    email: user.email
                }, changes, function (req, res) { });
                res.status(200).send({
                    message: 'Image updated!'
                });
            } else {
                res.status(200).json({
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

let deleteUser = function (req, res) {
    let {
        email
    } = req.body;

    if (!email) return res.status(400).json({
        error: true,
        message: "Missing required fields"
    });

    UserSchema.deleteOne({
        email
    }, function (err) {
        if (err) console.log(err);
        else {
            res.status(200).send({
                message: 'User removed!',
                email: email
            });
        }
    })
}

let googleLogin = function (req, res) {
    const id = req.body.id;
    googleClient.verifyIdToken({
        idToken: id
    })
        .then(googleResponse => {
            const responseData = googleResponse.getPayload();
            const email = responseData.email;
            UserSchema.findOne({
                email
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
        })
}


let signToken = function (email) {
    return jwt.sign({
        email
    }, process.env.TOKEN_SECRET, {
        expiresIn: "3h"
    });
}
module.exports = {
    createUser,
    // getUser,
    updateUser,
    getUsers,
    deleteUser,
    login,
    googleLogin
}