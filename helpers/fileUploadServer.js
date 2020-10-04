const multer = require('multer');
const path = require('path');
const fs = require('fs');
// storage filename and destination
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        fs.mkdirSync('./uploads/cv', { recursive: true })
        callback(null, "./uploads/cv");
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + file.originalname);
    }
});

//validate filetype
var fileFilter = function (req, file, callback) {
    var filetypes = /docx|pdf|doc/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(
        file.originalname).toLowerCase());
    if (mimetype && extname) {
        return callback(null, extname);
    }
    return callback("Error: File upload only supports the "
        + "following filetypes - " + filetypes);
}

// Define the maximum size for uploading 
// picture i.e. 5 MB. it is optional 
const maxSize = 5 * 1000 * 1000;
const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter
}).single("file");

module.exports.Upload = upload