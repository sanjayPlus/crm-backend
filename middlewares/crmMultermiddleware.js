const multer = require('multer')

// Multer configuration for storing files in disk storage

const storage  = multer.diskStorage({
    destination: function(req,file,cb){
 // Specify the directory where files will be stored
 cb(null,"./public/crm")
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with the original file extension
        const uniqueSuffix = Date.now();
        const fileExtension = file.originalname.split('.').pop(); // Get the file extension
        const newFilename = `${uniqueSuffix}.${fileExtension}`;
        cb(null, newFilename);
    },
});

const multerConfig = {
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
};
// Multer middleware for handling multiple fields
const crmUpload = multer(multerConfig).fields([
    { name: 'image', maxCount: 1 },
    { name: 'offerLetter', maxCount: 1 },
    { name: 'provisionalCertificate', maxCount: 1 },
]);

module.exports = {crmUpload}
