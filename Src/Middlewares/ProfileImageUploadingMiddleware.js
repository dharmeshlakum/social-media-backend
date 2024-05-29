import multer from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = join(__dirname, "../Assets/Profile");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
});

const uploader = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {

        const validTypes = /jpg|jpeg|png/;
        const validation = validTypes.test(file.originalname.toLowerCase());

        if (validation) {
            cb(null, true);

        } else {
            cb(new Error("Invalid file type"), false)
        }
    }
});

const profileImgMW = async (req, res, next) => {

    try {
        const upload = uploader.single("image");
        upload(req, res, (error) => {

            if (error instanceof multer.MulterError) {
                return res.status(415).json({ error: error.message });

            } else if (error) {
                return res.status(413).json({ error: error.message });

            } else {
                next();
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export default profileImgMW;