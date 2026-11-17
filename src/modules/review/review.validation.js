

import Joi from "joi";


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
// CREATE REVIEW (FR-28)
// The reviewer is taken from the JWT, so "user" is NOT allowed here.
// isApproved is NOT allowed either: a new review is always hidden (FR-29).
// =======================================

export const createReviewSchema = Joi.object({

  home: objectId.required().label("Home").messages({
    "any.required": "Home is required",
  }),

  rating: Joi.number().integer().min(1).max(5).required()
    .label("Rating")
    .messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be between 1 and 5",
      "number.max": "Rating must be between 1 and 5",
      "any.required": "Rating is required",
    }),

  comment: Joi.string().trim().min(3).max(1000).allow("").optional()
    .label("Comment")
    .messages({
      "string.min": "Comment must be at least 3 characters",
      "string.max": "Comment must be at most 1000 characters",
    }),

});


// =======================================
// APPROVE / HIDE REVIEW (FR-29, admin only)
// =======================================

export const setApprovalSchema = Joi.object({

  isApproved: Joi.boolean().required()
    .label("isApproved")
    .messages({
      "boolean.base": "isApproved must be true or false",
      "any.required": "isApproved is required",
    }),

});


// =======================================
// ADMIN LIST QUERY (all reviews, optional filters)
// =======================================

export const adminListReviewsQuerySchema = Joi.object({

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(10),

  isApproved: Joi.boolean().optional(),

  home: objectId.optional().label("Home"),

});


// =======================================
// PUBLIC LIST QUERY (approved reviews of one home, FR-13)
// =======================================

export const publicListReviewsQuerySchema = Joi.object({

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(10),

});