import express from 'express';
import upload from '../utils/multer.js';
import { uploadMedia} from '../utils/cloudinary.js';

const router = express.Router();
router.route('/upload-video').post(upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const result = await uploadMedia(req.file.path);
        return res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
export default router;