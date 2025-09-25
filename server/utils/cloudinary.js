import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config({});
 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
export const uploadMedia = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file,{
            resource_type: "auto", 
        }); 
        return uploadResponse;
    } catch (error) {
        console.error("Error uploading media to Cloudinary:", error);
        throw new Error("Failed to upload media");
        
    }
}
export const deleteMedia = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log("Media deleted from Cloudinary");  
    } catch (error) {
        console.error("Error deleting media from Cloudinary:", error);
        throw new Error("Failed to delete media");
        
    }
}
export const deletevideo = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId,{
            resource_type: "video"
        });
        console.log("Video deleted from Cloudinary");
        
    } catch (error) {
        console.error("Error deleting video from Cloudinary:", error); 
        throw new Error("Failed to delete video");
    }
}