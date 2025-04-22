import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier";

import { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from "../config";

cloudinary.config({
    api_key: CLOUDINARY_KEY || "",
    api_secret: CLOUDINARY_SECRET || "",
    cloud_name: CLOUDINARY_NAME || ""
})

export function cloudinaryUpload(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((err, res: UploadApiResponse ) => {
            if (err) return reject(err);

            resolve(res);
        });

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    })
}