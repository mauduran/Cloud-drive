const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { generateRandomName } = require('./random_names');

require('dotenv').config();

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
            let storageName = generateRandomName()+ req.body.extension;
            req.body.storageName = storageName;
            req.body.fileName = file.originalname + req.body.extension;
            cb(null, storageName);
        }
    })
})


const download = (key) => {
    const params = {
        Bucket: process.env.AWS_S3_FILE_BUCKET,
        Key: key
    };
    
    return s3.getObject(params).createReadStream();
}


module.exports = {
    upload,
    download
}