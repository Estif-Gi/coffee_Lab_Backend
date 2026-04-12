// middleware/file_upload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (make sure these env vars are set)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store file in memory so we can stream it to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadToCloudinary = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter,
});

// ✅ This is the missing piece — streams the buffer from memory to Cloudinary
const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'events' }, // Optional: organizes uploads in a Cloudinary folder
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

module.exports = { uploadToCloudinary, uploadBufferToCloudinary };