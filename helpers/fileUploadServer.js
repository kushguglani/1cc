const multer = require('multer');
const path = require('path');
const fs = require('fs');

// storage filename and destination
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        fs.mkdirSync(req.fileDetails.fileUploadPath, { recursive: true })
        callback(null, req.fileDetails.fileUploadPath);
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + file.originalname.replace(/ /g,"_"));
    }
});

//validate filetype
var fileFilter = function (req, file, callback) {
    var filetypes = req.fileDetails.filetypes;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(
        file.originalname).toLowerCase());
    if (mimetype && extname) {
        return callback(null, extname);
    }
    return callback("Error: File upload only supports the "
        + "following filetypes - " + filetypes);
}


module.exports = { storage, fileFilter}