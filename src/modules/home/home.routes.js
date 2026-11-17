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
} from "./home.validation.js";
import {
  getHomes,
  getMyHomes,
  getHome,
  createHome,
  updateHome,
} from "./home.controller.js";

const router = Router();

// Public: FR-8, FR-9, FR-30 to FR-37 (listing, search and filters)
router.get("/", validateQuery(listHomesQuerySchema), getHomes);

// Vendor: their own homes (FR-40). Must stay ABOVE "/:idOrSlug".
router.get("/mine", verifyToken, allowRoles("vendor"), getMyHomes);

// Public: FR-10, FR-11 (portfolio page, by id or slug)
router.get("/:idOrSlug", getHome);

// Vendor registration (FR-14). Order matters:
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

export default router;