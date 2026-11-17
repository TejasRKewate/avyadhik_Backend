
import mongoose from "mongoose";

import Review from "./review.model.js";
import Home from "../home/home.model.js";

const USER_FIELDS = "name";
const HOME_FIELDS = "name slug vendor";


export const create = async (data) => {
  const review = await Review.create(data);
  return review;
};

export const findById = async (id) => {
  return Review.findById(id)
    .populate("user", USER_FIELDS)
    .populate("home", HOME_FIELDS);
};

// Used to stop the same user reviewing the same home twice
export const findByUserAndHome = async (userId, homeId) => {
  return Review.findOne({ user: userId, home: homeId });
};

// Generic paginated list. Pass a filter such as
// { home: id, isApproved: true } or {} for the admin list.
export const findPaginated = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate("user", USER_FIELDS)
      .populate("home", HOME_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// FR-29: the admin approves (true) or hides (false) a review
export const setApproval = async (id, isApproved) => {
  return Review.findByIdAndUpdate(
    id,
    { isApproved },
    { new: true, runValidators: true }
  )
    .populate("user", USER_FIELDS)
    .populate("home", HOME_FIELDS);
};

// Average and count of APPROVED reviews only for one home.
// aggregate() does not cast ids, so the id is converted by hand.
export const getApprovedStats = async (homeId) => {
  const result = await Review.aggregate([
    {
      $match: {
        home: new mongoose.Types.ObjectId(String(homeId)),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: "$home",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  return {
    averageRating: result[0].averageRating,
    reviewCount: result[0].reviewCount,
  };
};

// Writes the calculated numbers onto the Home (FR-13, section 4.5)
export const updateHomeRating = async (homeId, averageRating, reviewCount) => {
  return Home.findByIdAndUpdate(
    homeId,
    { averageRating, reviewCount },
    { new: true }
  );
};