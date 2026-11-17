import fs from "fs";


// =======================================
// CLEAN UP UPLOADED FILES ON FAILURE
// Multer saves files BEFORE validation runs. If the request then fails
// (validation error, 404, 409, ...), the files would be left on disk.
// Place this BEFORE the upload middleware in the route.
// It checks req.files only when the response is finished, so it works
// for every failure after the upload, not just validation errors.
// =======================================

export const cleanupUploadsOnError = (req, res, next) => {

  res.on("finish", () => {

    if (res.statusCode < 400) return;

    const files = Array.isArray(req.files)
      ? req.files
      : req.file
        ? [req.file]
        : [];

    files.forEach((file) => {

      fs.unlink(file.path, () => {});

    });

  });

  next();

};