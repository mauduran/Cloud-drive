const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

aws.config.update({
    region: 'us-east-1'
})

const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'cloud-drive-test',
        metadata: function (req, file, cb) {
            cb(null, { originalname: file.originalname, mimetype: file.mimetype });
        },
        key: function (req, file, cb) {
            const filenameDivisionIndex = file.originalname.lastIndexOf('.');
            const filename = file.originalname.substr(0, filenameDivisionIndex);
            const ext = file.originalname.substr(filenameDivisionIndex);

            cb(null, filename + Date.now().toString() + ext);
        }
    })
})


const download = (key) => {
    const params = {
        Bucket: 'cloud-drive-test',
        Key: key
    };
    
    return s3.getObject(params).createReadStream();
}


module.exports = {
    upload,
    download
}