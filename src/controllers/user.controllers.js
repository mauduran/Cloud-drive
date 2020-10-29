const mongoose = require('../../config/db-connection');
const UserSchema = require('../models/user.model');

let createUser =  function(req, res) {

    let {name, email, imageUrl, multifactorSecret} = req.body;

    if(!name || !email) return res.status(400).json({error: true, message: "Missing required fields"});

    if(!imageUrl) imageUrl = 'None';

    if(!multifactorSecret) multifactorSecret = 'None';

    let newUser = {
        name, 
        email,
        joined : Date.now(),
        imageUrl,
        lastConnection : Date.now(),
        multifactorSecret,
        sharedWithMe : []
    }
    let userNew = UserSchema(newUser);

    UserSchema.findOne({email})
        .then(user => {
            if(!user) {
                userNew.save();
                res.json(userNew);
            }
        })
        .catch(err => {
            console.log(err);
            //res.status(500).send({message : 'Server error.', error : `${err}`});
            res.status(400).json(error);

        })
}

let getUsers = function(req, res) {
    UserSchema.find()
        .then(users => {
            if(users.length > 0) res.json({results : users, message : 'Data founded!', size : users.length});
            else {
                res.json({results : users, message : 'Users not founded! ', size : users.length});
            }
        })
        .catch(err => {
            console.log(err);
            //res.status(500).send({message : 'Server error.', error : `${err}`});
            res.status(400).json(error);

        })
}

let getUser = function(req, res) {
    let {name, email} = req.body;

    if(!name || !email) return res.status(400).json({error: true, message: "Missing required fields"});

    UserSchema.findOne({email})
        .then(user => {
            if(user) {
                res.json(user);
            } else {
                res.status(200).json({message: 'User not found!'});
            }
        })
        .catch(err => {
            console.log(err);
            //res.status(500).send({message : 'Server error.', error : `${err}`});
            res.status(400).json(error);

        }) 
}

let updateUser = function(req, res) {
    let {name, email, imageUrl} = req.body;

    if(!name || !email || !imageUrl) return res.status(400).json({error: true, message: "Missing required fields"});
    
    UserSchema.findOne({email})
    .then(user => {
        if(user) {
            UserSchema.findOneAndUpdate({email : user.email}, {imageUrl : imageUrl}, function(req, res) {});
            res.status(200).send({message: 'Image updated!'});
        } else {
            res.status(200).json({message: 'User not found!'});
        }
    })
    .catch(err => {
        console.log(err);
        //res.status(500).send({message : 'Server error.', error : `${err}`});
        res.status(400).json(error);

    }) 
}

let deleteUser = function(req, res) {
    let { email} = req.body;

    if(!email) return res.status(400).json({error: true, message: "Missing required fields"});

    UserSchema.deleteOne({email}, function(err) {
        if(err) console.log(err);
        else {
            res.status(200).send({message: 'User removed!', email : email});
        }
    })
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    getUsers,
    deleteUser
}