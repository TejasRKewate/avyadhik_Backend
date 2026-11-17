import express from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import {
  validate,
  validateQuery,
} from "../../common/middleware/validate.middleware.js";

import {
  createReview,
  getHomeReviews,
  getAllReviews,
  setReviewApproval,
} from "./review.controller.js";

import {
  createReviewSchema,
  setApprovalSchema,
  adminListReviewsQuerySchema,
  publicListReviewsQuerySchema,
} from "./review.validation.js";


const router = express.Router();


// =======================================
// PUBLIC: APPROVED REVIEWS OF ONE HOME (FR-13)
// No login needed. Only approved reviews are returned.
// =======================================

router.get(
  "/home/:homeId",
  validateQuery(publicListReviewsQuerySchema),
  getHomeReviews
);


// =======================================
// CREATE REVIEW (FR-28): role user only
// The service checks for an admitted booking.
// =======================================

router.post(
  "/",
  verifyToken,
  allowRoles("user"),
  validate(createReviewSchema),
  createReview
);


// =======================================
// ADMIN: ALL REVIEWS, approved and hidden
// =======================================

router.get(
  "/",
  verifyToken,
  allowRoles("admin"),
  validateQuery(adminListReviewsQuerySchema),
  getAllReviews
);


// =======================================
// ADMIN: APPROVE OR HIDE A REVIEW (FR-29)
// =======================================

router.patch(
  "/:id/approval",
  verifyToken,
  allowRoles("admin"),
  validate(setApprovalSchema),
  setReviewApproval
);


export default router;