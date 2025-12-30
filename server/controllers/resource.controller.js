import { Resource } from "../models/resource.model.js";
import Lecture from "../models/lecture.model.js";
import { uploadMedia, deleteMedia } from "../utils/cloudinary.js"; // Assuming similar util exists

import fs from 'fs';
import axios from 'axios';

export const createResource = async (req, res) => {
    try {
        console.log("--- CREATE RESOURCE HIT ---");
        const { lectureId } = req.params;
        const { title } = req.body;
        const file = req.file;

        console.log("File detected:", file.originalname, "Mime:", file.mimetype);

        if (!lectureId || !title || !file) {
            return res.status(400).json({ message: "Lecture ID, title, and file are required." });
        }

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found." });
        }

        const isImage = file.mimetype.startsWith('image/');
        const resourceType = isImage ? 'auto' : 'raw'; // Force 'raw' for PDFs to avoid corruption/processing

        console.log("Uploading to Cloudinary with resource_type:", resourceType);

        const uploadResult = await uploadMedia(file.path, { resource_type: resourceType });

        console.log("Cloudinary Result URL:", uploadResult.secure_url);

        const fileTypeMap = {
            'application/pdf': 'PDF',
            'image/jpeg': 'IMG',
            'image/png': 'IMG',
            'image/gif': 'IMG'
        };
        const fileType = fileTypeMap[file.mimetype] || 'FILE';

        const newResource = await Resource.create({
            title,
            fileUrl: uploadResult.secure_url,
            fileType,
            lectureId
        });

        // Add to lecture
        lecture.resources.push(newResource._id);
        await lecture.save();

        // Cleanup local file
        try {
            fs.unlinkSync(file.path);
        } catch (cleanupError) {
            console.error("Error deleting local file:", cleanupError);
        }

        return res.status(201).json({
            resource: newResource,
            message: "Resource uploaded successfully"
        });

    } catch (error) {
        console.error("Error creating resource:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const { resourceId } = req.params;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found." });
        }

        // Remove from lecture
        await Lecture.findByIdAndUpdate(resource.lectureId, {
            $pull: { resources: resourceId }
        });

        // Delete from Cloudinary
        // Extract publicId (assuming standard Cloudinary URL structure)
        const publicId = resource.fileUrl.split('/').pop().split('.')[0];
        try {
            await deleteMedia(publicId);
        } catch (err) {
            console.error("Failed to delete from Cloudinary:", err);
        }

        // Delete from DB
        await Resource.findByIdAndDelete(resourceId);

        return res.status(200).json({
            message: "Resource deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting resource:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const downloadResource = async (req, res) => {
    let resourceUrl = "unknown";
    try {
        console.log("--- DOWNLOAD RESOURCE HIT ---");
        const { resourceId } = req.params;
        console.log("Requested Resource ID:", resourceId);

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        resourceUrl = resource.fileUrl;
        console.log("Target URL:", resourceUrl);

        // DETECT BAD UPLOAD: PDF stored as Image
        if (resourceUrl.includes("/image/upload/") && resourceUrl.toLowerCase().endsWith(".pdf")) {
            console.error("CRITICAL: PDF uploaded as Image detected.");
            return res.status(400).json({
                message: "This PDF is corrupted (uploaded as Image). Please delete and Re-Upload it.",
                details: "URL contains /image/upload/ but is a .pdf"
            });
        }

        // Fetch file from Cloudinary (without custom flags)
        const response = await axios({
            url: resourceUrl,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Determine correct extension
        let extension = "pdf"; // Default safe fallback
        if (resource.fileType === 'PDF') {
            extension = "pdf";
        } else if (resource.fileType === 'IMG') {
            // Try to detect specific image type from header, or default to jpg
            const contentType = response.headers['content-type'];
            if (contentType === 'image/png') extension = "png";
            else if (contentType === 'image/gif') extension = "gif";
            else extension = "jpg";
        } else {
            // Fallback: try to get from URL, but handle no-extension case safe
            const urlPath = new URL(resourceUrl).pathname;
            if (urlPath.includes('.')) {
                extension = urlPath.split('.').pop();
            }
        }

        // Sanitize filename
        const safeTitle = resource.title.replace(/[^a-z0-9]/gi, '_');
        const filename = `${safeTitle}.${extension}`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type']);

        response.data.pipe(res);

    } catch (error) {
        console.error("Error downloading resource:", error.message);
        console.error("Full Error Details:", error.response?.data);

        // NO FALLBACK REDIRECT - We want to see the error!

        res.status(500).json({
            message: "Download failed (Proxy Error)",
            error: error.message,
            status: error.response?.status,
            url: resourceUrl
        });
    }
};
