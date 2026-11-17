import { Router } from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import {
  createServiceModelSchema,
  updateServiceModelSchema,
} from "./serviceModel.validation.js";
import {
  getServiceModels,
  getServiceModelById,
  createServiceModel,
  updateServiceModel,
  deleteServiceModel,
} from "./serviceModel.controller.js";

const router = Router();

// Public: FR-6 (home page lists service models / types of care)
router.get("/", getServiceModels);

// Public: one service model with its description
router.get("/:id", getServiceModelById);

// Admin only: manage service models (master data)
router.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  validate(createServiceModelSchema),
  createServiceModel
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  validate(updateServiceModelSchema),
  updateServiceModel
);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteServiceModel);

export default router;