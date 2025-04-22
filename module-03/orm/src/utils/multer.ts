import { Request } from "express";
import multer from "multer";
import path from "path";

export function Multer() {
    const storage = multer.memoryStorage();

    return multer({
        storage,
        limits: {
            fileSize: 1024 * 1024
        }
    })
}