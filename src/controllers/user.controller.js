const UserModel = require("../models/user.model");

const login = (req, res) => {
    res.json("User successfully deleted.");
}
const createUser = (req, res) => {
    res.json("User successfully created.");
}

const getUser = (req, res) => {
    res.json("This is the user response.");
}

const getUsers = (req, res) => {
    res.json("This is the user list response.");
}

const updateUser = (req, res) => {
    res.json("User updated.");
}

const changePassword = (req, res) => {
    res.json("Password changed.");
}

const deleteUser = (req, res) => {
    res.json("User successfully deleted.");
}


module.exports = {
    createUser,
    getUser,
    deleteUser,
    getUsers, 
    updateUser,
    changePassword,
    login
}