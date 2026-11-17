

import * as reviewService from "./review.service.js";


// =======================================
// ERROR HANDLER
// Errors thrown by the service carry a statusCode (400, 403, 404, 409...).
// Anything else is an unexpected error and becomes a 500.
// =======================================

const handleError = (res, error, label) => {

  if (error.statusCode) {

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

  }

  console.error(`${label} ERROR:`, error);

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });

};


// =======================================
// CREATE REVIEW
// POST /api/reviews   (role: user)
// The review stays hidden until the admin approves it.
// =======================================

export const createReview = async (req, res) => {

  try {

    const review = await reviewService.createReview(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted. It will appear after admin approval",
      data: review,
    });

  } catch (error) {

    return handleError(res, error, "CREATE REVIEW");

  }

};


// =======================================
// APPROVED REVIEWS OF ONE HOME (public)
// GET /api/reviews/home/:homeId
// =======================================

export const getHomeReviews = async (req, res) => {

  try {

    const result = await reviewService.getApprovedReviewsForHome(
      req.params.homeId,
      req.validatedQuery
    );

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });

  } catch (error) {

    return handleError(res, error, "GET HOME REVIEWS");

  }

};


// =======================================
// ALL REVIEWS, approved and hidden (admin)
// GET /api/reviews
// =======================================

export const getAllReviews = async (req, res) => {

  try {

    const result = await reviewService.getAllReviews(
      req.validatedQuery
    );

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });

  } catch (error) {

    return handleError(res, error, "GET ALL REVIEWS");

  }

};


// =======================================
// APPROVE OR HIDE A REVIEW (admin)
// PATCH /api/reviews/:id/approval
// =======================================

export const setReviewApproval = async (req, res) => {

  try {

    const review = await reviewService.setReviewApproval(
      req.params.id,
      req.body.isApproved
    );

    return res.status(200).json({
      success: true,
      message: req.body.isApproved
        ? "Review approved successfully"
        : "Review hidden successfully",
      data: review,
    });

  } catch (error) {

    return handleError(res, error, "SET REVIEW APPROVAL");

  }

};