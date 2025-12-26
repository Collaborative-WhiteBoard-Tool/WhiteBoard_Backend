import cloudinary from "../config/cloudinary.js";
import { cloudinaryUploadApiResponse } from "../types/cloudinary.type.js";
import streamifier from 'streamifier';

export const uploadToCloudinary = (fileBuffer: Buffer, folder = 'default_images'): Promise<cloudinaryUploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result as cloudinaryUploadApiResponse);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};
export const deleteFromCloudinary = async (publicId: string) => {
    return await cloudinary.uploader.destroy(publicId);
}