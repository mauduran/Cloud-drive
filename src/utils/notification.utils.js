const UserSchema = require('../models/user.model');

const generateNotification = async (userId, message, file) => {
    let newNotification = {
        fileId: file._id,
        message: message,
        emitterEmail: file.owner.email,
        emitterUserId: file.owner.id,
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
        return Promise.reject(false); 
    }
}



// const getUserNotifications = async(userId) => {
//     try {

//         const notifications = await NotificationSchema.find({ "receiverUserId": "5fb36802dcf25b49e07f8f77" });
//         console.log(notifications);
//         return Promise.resolve(notifications);
//     } catch (error) {
//         return Promise.reject(error);
//     }
// }

// const removeNotification = async(notificationID) => {
//     try {
//         const notification = await NotificationSchema.deleteOne({ _id: notificationID });
//         return Promise.resolve(notification);
//     } catch (error) {
//         return Promise.reject(error);
//     }
// }

// const clearUserNotifications = async(userID) => {
//     try {
//         const notifications = await NotificationSchema.deleteMany({ receiverUserId: userID });
//         return Promise.resolve(notifications);
//     } catch (error) {
//         return Promise.reject(error);
//     }
// }

module.exports = {
    generateNotification,
    deleteNotification
}