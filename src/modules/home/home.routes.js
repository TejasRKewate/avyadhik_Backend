import { Router } from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import {
  validate,
  validateQuery,
} from "../../common/middleware/validate.middleware.js";
import {
  homeImagesUpload,
  handleUploadError,
} from "../../common/middleware/upload.middleware.js";
import { cleanupUploadsOnError } from "../../common/middleware/cleanupUploads.middleware.js";

import {
  createHomeSchema,
  updateHomeSchema,
  listHomesQuerySchema,
  adminListQuerySchema,
  setListingSchema,
  removeImagesSchema,
} from "./home.validation.js";
import {
  getHomes,
  getMyHomes,
  getHome,
  createHome,
  updateHome,
  getAllHomesAdmin,
  getHomeAdmin,
  setListing,
  addHomeImages,
  removeHomeImages,
} from "./home.controller.js";

const router = Router();

// Public: FR-8, FR-9, FR-30 to FR-37 (listing, search and filters)
router.get("/", validateQuery(listHomesQuerySchema), getHomes);

// Vendor: their own homes (FR-40). Must stay ABOVE "/:idOrSlug".
router.get("/mine", verifyToken, allowRoles("vendor"), getMyHomes);

// Admin: every home, listed and unlisted. Must stay ABOVE "/:idOrSlug".
router.get(
  "/admin",
  verifyToken,
  allowRoles("admin"),
  validateQuery(adminListQuerySchema),
  getAllHomesAdmin
);

// Admin: one home, listed or unlisted (used by the edit form).
// Must stay ABOVE "/:idOrSlug".
router.get("/admin/:id", verifyToken, allowRoles("admin"), getHomeAdmin);

// Public: FR-10, FR-11 (portfolio page, by id or slug)
router.get("/:idOrSlug", getHome);

// Vendor registration (FR-14) or admin creating a home for a vendor.
// Order matters:
// login and role first (so strangers cannot write files to disk),
// then the cleanup hook, upload, upload errors, validation, controller.
router.post(
  "/",
  verifyToken,
  allowRoles("vendor", "admin"),
  cleanupUploadsOnError,
  homeImagesUpload.array("images", 10),
  handleUploadError,
  validate(createHomeSchema),
  createHome
);

// Corrections by staff (vendors cannot edit, FR-16)
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin", "manager"),
  validate(updateHomeSchema),
  updateHome
);

// Admin: list or unlist a home
router.patch(
  "/:id/listing",
  verifyToken,
  allowRoles("admin"),
  validate(setListingSchema),
  setListing
);

// Admin: add photos to an existing home
router.post(
  "/:id/images",
  verifyToken,
  allowRoles("admin"),
  cleanupUploadsOnError,
  homeImagesUpload.array("images", 10),
  handleUploadError,
  addHomeImages
);

// Admin: remove photos from a home
router.delete(
  "/:id/images",
  verifyToken,
  allowRoles("admin"),
  validate(removeImagesSchema),
  removeHomeImages
);

export default router;