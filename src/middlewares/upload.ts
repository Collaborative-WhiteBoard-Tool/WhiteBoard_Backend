import multer from 'multer'
import path from 'node:path';
import AppError from '../utils/appError.js';
const stroage = multer.memoryStorage()

export const upload = multer({
    storage: stroage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return cb(new AppError("JUST_ALLOW_IMAGE"))
        }
        cb(null, true)
    }
})
