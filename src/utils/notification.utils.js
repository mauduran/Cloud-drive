const UserSchema = require('../models/user.model');

const generateNotification = async (userId, message, file, emitter) => {
    let newNotification = {
        fileId: file._id,
        message: message,
        emitterEmail: emitter.email,
        emitterUserId: emitter.id,
        fileName: file.fileName
    }

    try {
        const res = await UserSchema.findByIdAndUpdate(userId, {$push: {notifications: newNotification}});
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(false); 
    }
}

const deleteNotification = async( userId, notificationId) =>{
    try {
        const res = await UserSchema.findByIdAndUpdate(userId, {$pull: {notifications:{ _id: notificationId} }});
        return Promise.resolve(true);
    } catch (error) {
        console.log(error);
        return Promise.reject(false); 
    }
}

const deleteAllNotifications = async(userId) => {
    try {
        const res = await UserSchema.findByIdAndUpdate(userId, {notifications:[]});
        return Promise.resolve(true);
    } catch (error) {
        console.log(error);
        return Promise.reject(false); 
    }
}

module.exports = {
    generateNotification,
    deleteNotification,
    deleteAllNotifications
}