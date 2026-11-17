import { Router } from "express";

import rateLimit from "express-rate-limit";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import {
  createListingRequestSchema,
  updateListingRequestStatusSchema,
} from "./listingRequest.validation.js";
import {
  createListingRequest,
  getListingRequests,
  getListingRequestById,
  updateListingRequestStatus,
} from "./listingRequest.controller.js";

const router = Router();

// The submit route is public, so limit it:
// 5 submissions per IP in 15 minutes
const listingRequestLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  limit: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    success: false,

    message: "Too many submissions from this device. Please try again later.",

  },

});

// Public: no login needed
router.post(
  "/",
  listingRequestLimiter,
  validate(createListingRequestSchema),
  createListingRequest
);

// Admin and Manager only (contact details are personal data)
router.get("/", verifyToken, allowRoles("admin", "manager"), getListingRequests);

router.get(
  "/:id",
  verifyToken,
  allowRoles("admin", "manager"),
  getListingRequestById
);

router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("admin", "manager"),
  validate(updateListingRequestStatusSchema),
  updateListingRequestStatus
);

export default router;