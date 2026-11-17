

import mongoose from "mongoose";

import * as reviewRepository from "./review.repository.js";
import * as bookingRepository from "../booking/booking.repository.js";
import Home from "../home/home.model.js";


// =======================================
// HELPERS
// =======================================

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertValidId = (id, label = "id") => {
  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, `Invalid ${label}`);
  }
};

// Average is stored with one decimal, for example 4.3
const roundRating = (value) => Math.round(value * 10) / 10;

// Recalculates averageRating and reviewCount from APPROVED reviews
// only, then writes them onto the Home (section 4.5, FR-13).
const refreshHomeRating = async (homeId) => {
  const { averageRating, reviewCount } =
    await reviewRepository.getApprovedStats(homeId);

  await reviewRepository.updateHomeRating(
    homeId,
    roundRating(averageRating),
    reviewCount
  );
};


// =======================================
// CREATE REVIEW (FR-28, FR-29)
// userId comes from the JWT, never from req.body.
// The review is always saved as hidden (isApproved: false), so the
// home's rating does NOT change until the admin approves it.
// =======================================

export const createReview = async (userId, body) => {

  // The home must exist
  const homeExists = await Home.exists({ _id: body.home });

  if (!homeExists) {
    throw httpError(404, "Home not found");
  }

  // FR-28: only a user with an admitted booking for this home
  const admitted = await bookingRepository.hasAdmittedBooking(
    userId,
    body.home
  );

  if (!admitted) {
    throw httpError(
      403,
      "You can review a home only after you have been admitted there"
    );
  }

  // One review per user per home
  const existing = await reviewRepository.findByUserAndHome(
    userId,
    body.home
  );

  if (existing) {
    throw httpError(409, "You have already reviewed this home");
  }

  try {

    const review = await reviewRepository.create({
      user: userId,
      home: body.home,
      rating: body.rating,
      comment: body.comment || undefined,
    });

    return reviewRepository.findById(review._id);

  } catch (error) {

    // Two requests at the same moment can both pass the check above;
    // the unique index then rejects the second one (section 6).
    if (error.code === 11000) {
      throw httpError(409, "You have already reviewed this home");
    }

    throw error;

  }

};


// =======================================
// PUBLIC: APPROVED REVIEWS OF ONE HOME (FR-13)
// Hidden reviews are never returned here.
// =======================================

export const getApprovedReviewsForHome = async (homeId, query = {}) => {

  assertValidId(homeId, "home id");

  const homeExists = await Home.exists({ _id: homeId });

  if (!homeExists) {
    throw httpError(404, "Home not found");
  }

  return reviewRepository.findPaginated(
    { home: homeId, isApproved: true },
    { page: query.page, limit: query.limit }
  );

};


// =======================================
// ADMIN: ALL REVIEWS (approved and hidden)
// =======================================

export const getAllReviews = async (query = {}) => {

  const filter = {};

  if (query.isApproved !== undefined) {
    filter.isApproved = query.isApproved;
  }

  if (query.home) {
    filter.home = query.home;
  }

  return reviewRepository.findPaginated(filter, {
    page: query.page,
    limit: query.limit,
  });

};


// =======================================
// ADMIN: APPROVE OR HIDE A REVIEW (FR-29)
// After the change the home's averageRating and reviewCount are
// recalculated from approved reviews, so hiding a review that was
// already approved removes it from the rating again.
// =======================================

export const setReviewApproval = async (id, isApproved) => {

  assertValidId(id, "review id");

  const review = await reviewRepository.findById(id);

  if (!review) {
    throw httpError(404, "Review not found");
  }

  const updated = await reviewRepository.setApproval(id, isApproved);

  // review.home is populated, so take the id from it
  const homeId = review.home?._id || review.home;

  if (homeId) {
    await refreshHomeRating(homeId);
  }

  return updated;

};