

import express from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import {
  validate,
  validateQuery,
} from "../../common/middleware/validate.middleware.js";
import { cleanupUploadsOnError } from "../../common/middleware/cleanupUploads.middleware.js";
import {
  healthReportUpload,
  handleUploadError,
} from "../../common/middleware/upload.middleware.js";

import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getHealthReport,
} from "./booking.controller.js";

import {
  createBookingSchema,
  updateBookingStatusSchema,
  listBookingsQuerySchema,
} from "./booking.validation.js";


const router = express.Router();

// Every booking route needs a logged-in user
router.use(verifyToken);


// =======================================
// CREATE BOOKING (FR-17): role user only
// Order matters: cleanup -> multer -> upload error handler -> validate.
// Multer must run before validate, because a multipart body is empty
// until multer parses it.
// =======================================

router.post(
  "/",
  allowRoles("user"),
  cleanupUploadsOnError,
  healthReportUpload.array("reportImages", 5),
  handleUploadError,
  validate(createBookingSchema),
  createBooking
);


// =======================================
// LIST BOOKINGS (FR-23, FR-24, FR-25)
// The service filters the list by role.
// =======================================

router.get(
  "/",
  allowRoles("admin", "manager", "vendor", "user"),
  validateQuery(listBookingsQuerySchema),
  getBookings
);


// =======================================
// HEALTH REPORT IMAGE (FR-26)
// Placed before "/:id" routes for clarity.
// =======================================

router.get(
  "/:id/reports/:filename",
  allowRoles("admin", "manager", "vendor", "user"),
  getHealthReport
);


// =======================================
// UPDATE STATUS (FR-24, FR-27)
// =======================================

router.patch(
  "/:id/status",
  allowRoles("admin", "manager", "vendor"),
  validate(updateBookingStatusSchema),
  updateBookingStatus
);


// =======================================
// GET ONE BOOKING
// =======================================

router.get(
  "/:id",
  allowRoles("admin", "manager", "vendor", "user"),
  getBookingById
);


export default router;