const multer = require('multer');
let fs = require('fs-extra');

const DIR = '../uploads/users/';

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        fs.mkdirsSync(DIR);
        cb(null, DIR)
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.')[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + ext)
    }
})

var upload = multer({
    storage: storage,
})

module.exports = upload;