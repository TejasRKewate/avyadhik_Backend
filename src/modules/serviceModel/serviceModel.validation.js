import Joi from "joi";


// =======================================
// REUSABLE FIELD RULES
// =======================================

const name = Joi.string().trim().min(2).max(100).messages({

  "string.empty": "Service model name is required",

  "string.min": "Service model name must be at least 2 characters",

  "string.max": "Service model name must be at most 100 characters",

});

// Optional. If missing, the service builds it from the name.
// Only lowercase letters, numbers and hyphens, like "post-operative-care"
const slug = Joi.string()

  .trim()

  .lowercase()

  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

  .messages({

    "string.empty": "Slug cannot be empty",

    "string.pattern.base":

      "Slug can only have lowercase letters, numbers and single hyphens",

  });

// Optional image URL. An empty string is allowed (no icon).
const icon = Joi.string().trim().uri().allow("").messages({

  "string.uri": "Icon must be a valid URL",

});

// Optional text shown on the service-model page (FR-6)
const description = Joi.string().trim().max(1000).allow("").messages({

  "string.max": "Description must be at most 1000 characters",

});


// =======================================
// CREATE SERVICE MODEL
// Only name is required
// =======================================

export const createServiceModelSchema = Joi.object({

  name: name.required().messages({

    "any.required": "Service model name is required",

  }),

  slug,

  icon,

  description,

});


// =======================================
// UPDATE SERVICE MODEL
// Every field is optional, but at least one must be sent
// =======================================

export const updateServiceModelSchema = Joi.object({

  name,

  slug,

  icon,

  description,

})

  .min(1)

  .messages({

    "object.min": "Send at least one field to update",

  });