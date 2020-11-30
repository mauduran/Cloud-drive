const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { generateRandomName } = require('./random_names');

if (process.env.NODE_ENV == 'dev') {
    require('dotenv').config();
}
aws.config.update({
    region: 'us-east-1'
})

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_FILE_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, { originalname: file.originalname + req.body.extension, mimetype: file.mimetype });
        },
        key: function (req, file, cb) {
            let storageName = generateRandomName() + req.body.extension;
            req.body.storageName = storageName;
            req.body.fileName = file.originalname + req.body.extension;
            cb(null, storageName);
        }
    })
})

const uploadImage = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_IMAGE_BUCKET,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { originalname: file.originalname + req.body.extension, mimetype: file.mimetype });
        },
        key: function (req, file, cb) {
            let storageName = generateRandomName() + req.body.extension;
            req.body.storageName = storageName;
            req.body.fileName = file.originalname + req.body.extension;
            cb(null, storageName);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
})


const download = (key) => {
    const params = {
        Bucket: process.env.AWS_S3_FILE_BUCKET,
        Key: key
    };

    return s3.getObject(params).createReadStream();
}

const deleteMany = (arrayKeys) => {
    const params = {
        Bucket: process.env.AWS_S3_FILE_BUCKET,
        Delete: {
            Objects: arrayKeys,
            Quiet: false
        }
    };
    return s3.deleteObjects(params).promise();
}

module.exports = {
    upload,
    uploadImage,
    download,
    deleteMany
}