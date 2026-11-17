

import Joi from "joi";
import { BOOKING_STATUSES } from "./booking.model.js";


// =======================================
// REUSABLE: MongoDB ObjectId (24 hex characters)
// =======================================

const objectId = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{#label} must be a valid id",
  });


// =======================================
// CREATE BOOKING (FR-17 to FR-20, FR-38)
// The booker is taken from the JWT, so "user" is NOT allowed here.
// Report images come from multer (req.files), not from the body.
// =======================================

export const createBookingSchema = Joi.object({

  home: objectId.required().label("Home").messages({
    "any.required": "Home is required",
  }),

  elderName: Joi.string().trim().min(2).max(100).required()
    .label("Elder's name")
    .messages({
      "string.empty": "Elder's name is required",
      "any.required": "Elder's name is required",
    }),

  elderAge: Joi.number().integer().min(1).max(120).required()
    .label("Elder's age")
    .messages({
      "number.base": "Elder's age must be a number",
      "any.required": "Elder's age is required",
    }),

  relationToElder: Joi.string().trim().min(2).max(50).required()
    .label("Relationship to the elder")
    .messages({
      "string.empty": "Relationship to the elder is required",
      "any.required": "Relationship to the elder is required",
    }),

  healthCondition: Joi.string().trim().max(1000).allow("").optional()
    .label("Health condition"),

  contactPreference: Joi.string().lowercase().valid("whatsapp", "phone", "email")
    .required()
    .label("Contact preference")
    .messages({
      "any.only": "Contact preference must be whatsapp, phone or email",
      "any.required": "Contact preference is required",
    }),

});


// =======================================
// UPDATE STATUS (FR-21, FR-24, FR-27)
// =======================================

export const updateBookingStatusSchema = Joi.object({

  status: Joi.string().valid(...BOOKING_STATUSES).required()
    .label("Status")
    .messages({
      "any.only": `Status must be one of: ${BOOKING_STATUSES.join(", ")}`,
      "any.required": "Status is required",
    }),

});


// =======================================
// LIST QUERY (paginated, optional status filter)
// =======================================

export const listBookingsQuerySchema = Joi.object({

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(10),

  status: Joi.string().valid(...BOOKING_STATUSES).optional(),

});