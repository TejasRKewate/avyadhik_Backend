import { Router } from "express";

import rateLimit from "express-rate-limit";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import {
  createEnquirySchema,
  updateEnquiryStatusSchema,
} from "./enquiry.validation.js";
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "./enquiry.controller.js";

const router = Router();

// The submit route is public, so limit it:
// 5 enquiries per IP in 15 minutes
const enquiryLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  limit: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success: false,

    message: "Too many enquiries from this device. Please try again later.",

  },

});

// Public: no login needed (FR-46)
router.post("/", enquiryLimiter, validate(createEnquirySchema), createEnquiry);

// Admin and Manager only (FR-48)
router.get("/", verifyToken, allowRoles("admin", "manager"), getEnquiries);

router.get(
  "/:id",
  verifyToken,
  allowRoles("admin", "manager"),
  getEnquiryById
);

router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("admin", "manager"),
  validate(updateEnquiryStatusSchema),
  updateEnquiryStatus
);

export default router;