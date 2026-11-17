import mongoose from "mongoose";


// =======================================
// FIXED LIST
// =======================================

export const LISTING_REQUEST_STATUSES = [
  "new",
  "contacted",
  "verified",
  "rejected",
];


const listingRequestSchema = new mongoose.Schema(

  {

    propertyName: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [150, "Property name is too long"],
    },

    operatorName: {
      type: String,
      required: [true, "Your name is required"],
      trim: true,
      maxlength: [100, "Name is too long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // 10-digit Indian mobile number, without the +91
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"],
    },

    // City name as chosen on the form (for the team to read)
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City is too long"],
    },

    // Free text, for example "assisted living"
    careTypes: {
      type: String,
      required: [true, "Care offered is required"],
      trim: true,
      maxlength: [200, "Care offered is too long"],
    },

    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    // Must be true: authorised to submit and agreed to verification
    consent: {
      type: Boolean,
      required: [true, "Consent is required"],
      validate: {
        validator: (value) => value === true,
        message: "You must confirm you are authorised to submit this",
      },
    },


    // ---------- Handled by Admin / Manager ----------

    status: {
      type: String,
      enum: LISTING_REQUEST_STATUSES,
      default: "new",
    },

    // Filled in once the team has created the home for this operator
    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      default: null,
    },

  },

  { timestamps: true }

);


// =======================================
// INDEXES
// Admin / Manager list: filter by status, newest first
// =======================================

listingRequestSchema.index({ status: 1, createdAt: -1 });


const ListingRequest = mongoose.model("ListingRequest", listingRequestSchema);

export default ListingRequest;