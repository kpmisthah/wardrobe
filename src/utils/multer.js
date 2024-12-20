import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload path
const uploadPath = path.join(__dirname, "../uploads/re-image");
console.log("Upload path",uploadPath)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
// Date.now(): Generates a timestamp, ensuring unique file names.
// file.originalname: Keeps the original file name after the timestamp.
// cb(null, ...) sets the file name. null indicates no error.
export {storage}
