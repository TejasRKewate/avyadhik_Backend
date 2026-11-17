import { Router } from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import {
  createCitySchema,
  updateCitySchema,
} from "./city.validation.js";
import {
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
} from "./city.controller.js";

const router = Router();

// Public: FR-5 (home page lists cities)
router.get("/", getCities);

// Public: one city by id
router.get("/:id", getCityById);

// Admin only: manage cities (master data)
router.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  validate(createCitySchema),
  createCity
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  validate(updateCitySchema),
  updateCity
);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteCity);

export default router;