import Joi from "joi";

import {
  STATES,
  LOOKING_FOR,
  MONTHLY_BUDGETS,
  ENQUIRY_STATUSES,
} from "./enquiry.model.js";

// The controller imports this name
export const STATUSES = ENQUIRY_STATUSES;

// =======================================
// CREATE ENQUIRY (public form, sent once at the end of step 3)
// status is NOT allowed here: a visitor cannot set it
// =======================================

export const createEnquirySchema = Joi.object({

  // Step 1
  state: Joi.string().valid(...STATES).required().messages({
    "any.only": "Please select a valid state or union territory",
    "any.required": "State is required",
  }),

  cityOrArea: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "City or area is required",
    "string.min": "City or area must be at least 2 characters",
    "any.required": "City or area is required",
  }),

  // Step 2
  lookingFor: Joi.string().valid(...LOOKING_FOR).required().messages({
    "any.only": "Please select who the home is for",
    "any.required": "Please select who the home is for",
  }),

  supportNeeded: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid support needed",
    "string.length": "Invalid support needed",
    "any.required": "Support needed is required",
  }),

  monthlyBudget: Joi.string().valid(...MONTHLY_BUDGETS).required().messages({
    "any.only": "Please select a valid monthly budget",
    "any.required": "Monthly budget is required",
  }),

  // Step 3
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
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

  email: Joi.string().trim().lowercase().email().max(150).required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  // Must be exactly true. false or missing is rejected.
  consent: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to be contacted and accept the privacy policy",
    "any.required": "You must agree to be contacted and accept the privacy policy",
  }),

});

// =======================================
// UPDATE STATUS (admin / manager)
// =======================================

export const updateEnquiryStatusSchema = Joi.object({

  status: Joi.string().valid(...ENQUIRY_STATUSES).required().messages({
    "any.only": `Status must be one of: ${ENQUIRY_STATUSES.join(", ")}`,
    "any.required": "Status is required",
  }),

});