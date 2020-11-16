const UserSchema = require('../models/user.model');
const TokenSchema = require('../models/tokens.model');
const jwt = require("jsonwebtoken");

let authMiddleware = function (req, res, next) {
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({error:true, message: "Missing authorization header"})
    TokenSchema.findOne({token})
        .then(tokenObj => {
            if (tokenObj) {
                console.log(token.token)
                const verification = jwt.verify(tokenObj.token, process.env.TOKEN_SECRET)
                if (verification) {
                    return UserSchema.findById(tokenObj.userId)
                }
            }
            throw "token not found"
        })
        .then(user => {
            delete user.hash
            req.body._user = user
            next()
        })
        .catch(error => {
            console.log(error)
            return res.status(401).json({
            error: true,
            message: "Unexpected Error!"}
        )}
        )
}
module.exports = authMiddleware 