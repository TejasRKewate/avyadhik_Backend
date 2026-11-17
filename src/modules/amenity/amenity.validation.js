import Joi from "joi";


// Same list as the model's enum
const CATEGORIES = ["lifestyle", "medical", "services", "community"];


// =======================================
// REUSABLE FIELD RULES
// =======================================

const name = Joi.string().trim().min(2).max(100).messages({

  "string.empty": "Amenity name is required",

  "string.min": "Amenity name must be at least 2 characters",

  "string.max": "Amenity name must be at most 100 characters",

});

const category = Joi.string()

  .valid(...CATEGORIES)

  .messages({

    "any.only": `Category must be one of: ${CATEGORIES.join(", ")}`,

    "string.empty": "Category is required",

  });

// Optional image URL. An empty string is allowed (no icon).
const icon = Joi.string().trim().uri().allow("").messages({

  "string.uri": "Icon must be a valid URL",

});


// =======================================
// CREATE AMENITY
// name and category are required
// =======================================

export const createAmenitySchema = Joi.object({

  name: name.required().messages({

    "any.required": "Amenity name is required",

  }),

  category: category.required().messages({

    "any.required": "Category is required",

  }),

  icon,

});


// =======================================
// UPDATE AMENITY
// Every field is optional, but at least one must be sent
// =======================================

export const updateAmenitySchema = Joi.object({

  name,

  category,

  icon,

})

  .min(1)

  .messages({

    "object.min": "Send at least one field to update",

  });