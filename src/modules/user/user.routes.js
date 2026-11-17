import { Router } from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  createStaffSchema,
} from "./user.validation.js";
import {
  registerUser,
  loginUser,
  createStaff,
  getMe
} from "./user.controller.js";

const router = Router();

// Public: FR-1 (User or Vendor self-registration)
router.post("/register", validate(registerSchema), registerUser);

// Public: FR-2 (login returns a JWT)
router.post("/login", validate(loginSchema), loginUser);

router.get("/me", verifyToken, getMe)

// Admin only: FR-4 (create admin, manager or viewer accounts)
router.post(
  "/staff",
  verifyToken,
  allowRoles("admin"),
  validate(createStaffSchema),
  createStaff
);

export default router;