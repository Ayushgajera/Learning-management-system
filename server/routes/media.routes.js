import express from 'express';
import fs from 'fs';
import path from 'path';
import upload from '../utils/multer.js';
import { uploadMedia, uploadLargeMedia } from '../utils/cloudinary.js';

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();
router.route('/upload-video').post(upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const fileSizeMB = req.file.size / (1024 * 1024);

        let result;
        if (fileSizeMB > 10) {
            result = await uploadLargeMedia(req.file.path);
        } else {
            result = await uploadMedia(req.file.path);
        }

        // Clean up temp file after successful upload
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to clean up temp file:', err);
        });

        return res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: result,
        });
    } catch (error) {
        // Clean up temp file on error too
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
        console.error('Error uploading video:', error);
        const message = error.message || 'Internal server error';
        if (message.includes('Failed to upload')) {
            return res.status(502).json({ message: 'Failed to upload video to cloud storage. Please try again or use a smaller file.' });
        }
        return res.status(500).json({ message });
    }
});
export default router;
