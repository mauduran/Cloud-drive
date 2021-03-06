const UserSchema = require('../models/user.model');

const updateUserProfilePicId = async (id, location) => {
    try {
        let oldResult = await UserSchema.findByIdAndUpdate(id, { imageUrl : location });
        return Promise.resolve({fileChanged: oldResult});
    } catch (error) {
        console.log(error);
        return Promise.reject(false);
    }
}


module.exports = {
    updateUserProfilePicId
}
