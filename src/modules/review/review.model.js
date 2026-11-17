import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema(

  {

    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: [true, "Home is required"],
    },

    // Set from the JWT of the logged-in user, never from req.body
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },

    comment: {
      type: String,
      trim: true,
    },

    // Hidden until the admin approves (FR-29)
    isApproved: {
      type: Boolean,
      default: false,
    },

  },

  { timestamps: true }

);


// =======================================
// INDEXES
// =======================================

// Fast lookup of approved reviews for a home's page
reviewSchema.index({ home: 1, isApproved: 1 });

// One review per user per home
reviewSchema.index({ user: 1, home: 1 }, { unique: true });


const Review = mongoose.model("Review", reviewSchema);

export default Review;