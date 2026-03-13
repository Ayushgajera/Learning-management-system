import express from 'express';
import fs from 'fs';
import upload from '../utils/multer.js';
import { uploadMedia } from '../utils/cloudinary.js';

const router = express.Router();
router.route('/upload-video').post(upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const result = await uploadMedia(req.file.path);

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
        return res.status(500).json({ message: 'Internal server error' });
    }
});
export default router;
