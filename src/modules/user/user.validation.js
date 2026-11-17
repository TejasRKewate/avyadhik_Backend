import Joi from "joi";


// =======================================
// REUSABLE FIELD RULES
// =======================================

const name = Joi.string().trim().min(2).max(100).required().messages({

  "string.empty": "Name is required",

  "string.min": "Name must be at least 2 characters",

  "string.max": "Name must be at most 100 characters",

  "any.required": "Name is required",

});

const email = Joi.string().trim().lowercase().email().required().messages({

  "string.empty": "Email is required",

  "string.email": "Please enter a valid email",

  "any.required": "Email is required",

});

// India: 10 digits, no +91 (same rule as the enquiry phone)
const phone = Joi.string().trim().pattern(/^\d{10}$/).required().messages({

  "string.empty": "Phone is required",

  "string.pattern.base": "Phone must be 10 digits (without +91)",

  "any.required": "Phone is required",

});

// min 6 matches the model; max 72 is the limit bcrypt can use
const password = Joi.string().min(6).max(72).required().messages({

  "string.empty": "Password is required",

  "string.min": "Password must be at least 6 characters",

  "string.max": "Password must be at most 72 characters",

  "any.required": "Password is required",

});


// =======================================
// REGISTER (FR-1)
// Role is optional and can only be user or vendor.
// Default is user.
// =======================================

export const registerSchema = Joi.object({

  name,

  email,

  phone,

  password,

  role: Joi.string().valid("user", "vendor").default("user").messages({

    "any.only": "Role must be user or vendor",

  }),

});


// =======================================
// LOGIN (FR-2)
// =======================================

export const loginSchema = Joi.object({

  email,

  password: Joi.string().required().messages({

    "string.empty": "Password is required",

    "any.required": "Password is required",

  }),

});


// =======================================
// CREATE STAFF (FR-4)
// Role is required and can only be admin, manager or viewer.
// =======================================

export const createStaffSchema = Joi.object({

  name,

  email,

  phone,

  password,

  role: Joi.string().valid("admin", "manager", "viewer").required().messages({

    "any.only": "Role must be admin, manager or viewer",

    "any.required": "Role is required",

  }),

});