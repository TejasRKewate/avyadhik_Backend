import Joi from "joi";

import { LISTING_REQUEST_STATUSES } from "./listingRequest.model.js";

// The controller imports this name
export const STATUSES = LISTING_REQUEST_STATUSES;

// =======================================
// CREATE LISTING REQUEST (public form, sent once at the end of step 3)
// status and home are NOT allowed here: a visitor cannot set them
// =======================================

export const createListingRequestSchema = Joi.object({

  // Step 1
  propertyName: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Property name is required",
    "string.min": "Property name must be at least 2 characters",
    "any.required": "Property name is required",
  }),

  city: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "City is required",
    "any.required": "City is required",
  }),

  careTypes: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Care offered is required",
    "string.min": "Care offered must be at least 2 characters",
    "any.required": "Care offered is required",
  }),

  // Step 2
  operatorName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Your name is required",
    "string.min": "Your name must be at least 2 characters",
    "any.required": "Your name is required",
  }),

  email: Joi.string().trim().lowercase().email().max(150).required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  // 10-digit Indian mobile, optionally with +91 (the service strips it)
  phone: Joi.string()
    .trim()
    .pattern(/^(\+91[\s-]?)?[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Enter a valid 10-digit Indian mobile number",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),

  websiteUrl: Joi.string()
    .trim()
    .uri({ scheme: ["http", "https"] })
    .max(300)
    .allow("")
    .messages({
      "string.uri": "Website must start with http:// or https://",
    }),

  // Step 3
  message: Joi.string().trim().max(3000).allow("").messages({
    "string.max": "Notes are too long",
  }),

  // Must be exactly true. false or missing is rejected.
  consent: Joi.boolean().valid(true).required().messages({
    "any.only": "You must confirm you are authorised to submit this",
    "any.required": "You must confirm you are authorised to submit this",
  }),

});

// =======================================
// UPDATE STATUS (admin / manager)
// =======================================

export const updateListingRequestStatusSchema = Joi.object({

  status: Joi.string().valid(...LISTING_REQUEST_STATUSES).required().messages({
    "any.only": `Status must be one of: ${LISTING_REQUEST_STATUSES.join(", ")}`,
    "any.required": "Status is required",
  }),

});