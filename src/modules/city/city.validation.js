import Joi from "joi";


// =======================================
// REUSABLE FIELD RULES
// =======================================

const name = Joi.string().trim().min(2).max(100).messages({

  "string.empty": "City name is required",

  "string.min": "City name must be at least 2 characters",

  "string.max": "City name must be at most 100 characters",

});

// Optional. If missing, the service builds it from the name.
// Only lowercase letters, numbers and hyphens, like "gurgaon-and-delhi-ncr"
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

// Same limits as the model
const latitude = Joi.number().min(-90).max(90).messages({

  "number.base": "Latitude must be a number",

  "number.min": "Latitude must be between -90 and 90",

  "number.max": "Latitude must be between -90 and 90",

});

const longitude = Joi.number().min(-180).max(180).messages({

  "number.base": "Longitude must be a number",

  "number.min": "Longitude must be between -180 and 180",

  "number.max": "Longitude must be between -180 and 180",

});


// =======================================
// CREATE CITY
// name, latitude and longitude are required
// =======================================

export const createCitySchema = Joi.object({

  name: name.required().messages({

    "any.required": "City name is required",

  }),

  slug,

  icon,

  latitude: latitude.required().messages({

    "any.required": "Latitude is required",

  }),

  longitude: longitude.required().messages({

    "any.required": "Longitude is required",

  }),

});


// =======================================
// UPDATE CITY
// Every field is optional, but at least one must be sent
// =======================================

export const updateCitySchema = Joi.object({

  name,

  slug,

  icon,

  latitude,

  longitude,

})

  .min(1)

  .messages({

    "object.min": "Send at least one field to update",

  });