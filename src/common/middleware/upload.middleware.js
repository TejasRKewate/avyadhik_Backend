import multer from "multer";
import path from "path";
import fs from "fs";


// =====================================================
// ALLOWED IMAGE TYPES
// The file extension is taken from this list (by mimetype),
// never from the client's file name.
// =====================================================

const EXT_BY_TYPE = {

    "image/jpeg": ".jpg",

    "image/jpg": ".jpg",

    "image/png": ".png",

    "image/webp": ".webp",

};

const ALLOWED_IMAGE_TYPES = Object.keys(EXT_BY_TYPE);


// =====================================================
// CREATE UPLOADER
//
// folderName : sub folder name
// options.baseDir  : "uploads" (public) or
//                    "private-uploads" (NOT public)
// options.maxFiles : maximum number of files
// options.maxSize  : maximum size of one file (bytes)
// =====================================================

const createUploader = (folderName, options = {}) => {

    const baseDir = options.baseDir || "uploads";


    // =================================================
    // UPLOAD PATH
    // =================================================

    const uploadPath = path.join(

        process.cwd(),

        baseDir,

        folderName

    );


    // =================================================
    // CREATE DIRECTORY IF NOT EXISTS
    // =================================================

    if (!fs.existsSync(uploadPath)) {

        fs.mkdirSync(uploadPath, {

            recursive: true,

        });

    }


    // =================================================
    // STORAGE
    // =================================================

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            cb(null, uploadPath);

        },

        filename: (req, file, cb) => {

            // fileFilter has already allowed only known types
            const ext = EXT_BY_TYPE[file.mimetype];

            const uniqueName =
                `${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${ext}`;

            cb(null, uniqueName);

        },

    });


    // =================================================
    // FILE FILTER (images only)
    // =================================================

    const fileFilter = (req, file, cb) => {

        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {

            return cb(null, true);

        }

        return cb(

            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            ),

            false

        );

    };


    // =================================================
    // MULTER INSTANCE
    // =================================================

    return multer({

        storage,

        fileFilter,

        limits: {

            files: options.maxFiles || 5,

            fileSize: options.maxSize || 5 * 1024 * 1024,

        },

    });

};


// =====================================================
// HOME IMAGES UPLOAD (public)
//
// Frontend field name MUST be: images
// Usage: homeImagesUpload.array("images", 10)
// =====================================================

export const homeImagesUpload = createUploader(

    "homes",

    {

        baseDir: "uploads",

        maxFiles: 10,

        maxSize: 5 * 1024 * 1024,

    }

);


// =====================================================
// HEALTH REPORT UPLOAD (PRIVATE)
//
// Saved in "private-uploads", NOT in "uploads".
// Do NOT serve this folder with express.static.
// Files must be served only through a protected route
// (vendor of that home, admin, manager, uploading user).
//
// Frontend field name MUST be: reportImages
// Usage: healthReportUpload.array("reportImages", 5)
// =====================================================

export const healthReportUpload = createUploader(

    "health-reports",

    {

        baseDir: "private-uploads",

        maxFiles: 5,

        maxSize: 5 * 1024 * 1024,

    }

);


// =====================================================
// MULTER ERROR HANDLER
//
// Place it right AFTER the upload middleware in a route.
// Turns multer errors into clean 400 responses
// instead of a generic 500.
// =====================================================

export const handleUploadError = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        let message = err.message;

        if (err.code === "LIMIT_FILE_SIZE") {

            message = "File is too large";

        }

        else if (
            err.code === "LIMIT_FILE_COUNT" ||
            err.code === "LIMIT_UNEXPECTED_FILE"
        ) {

            message = "Too many files, or wrong field name";

        }

        return res.status(400).json({

            success: false,

            message,

        });

    }

    // Errors thrown by our fileFilter
    if (err && err.message && err.message.startsWith("Only ")) {

        return res.status(400).json({

            success: false,

            message: err.message,

        });

    }

    return next(err);

};


// =====================================================
// EXPORT CREATOR
// =====================================================

export { createUploader };