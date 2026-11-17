import { Router } from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import {
  createAmenitySchema,
  updateAmenitySchema,
} from "./amenity.validation.js";
import {
  getAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from "./amenity.controller.js";

const router = Router();

// Public: list amenities.
// Optional filter: GET /?category=lifestyle
// (lifestyle, medical, services or community)
router.get("/", getAmenities);

// Public: one amenity by id
router.get("/:id", getAmenityById);

// Admin only: manage amenities (master data)
router.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  validate(createAmenitySchema),
  createAmenity
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  validate(updateAmenitySchema),
  updateAmenity
);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteAmenity);

export default router;