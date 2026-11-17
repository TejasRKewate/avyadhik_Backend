import mongoose from "mongoose";


export const BOOKING_STATUSES = [
  "new",
  "contacted",
  "visit scheduled",
  "admitted",
  "rejected",
];


const bookingSchema = new mongoose.Schema(

  {

    // The booker. Set from the JWT of the logged-in user, never from req.body.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // The home chosen for this booking
    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: [true, "Home is required"],
    },

    elderName: {
      type: String,
      required: [true, "Elder's name is required"],
      trim: true,
    },

    elderAge: {
      type: Number,
      required: [true, "Elder's age is required"],
      min: [1, "Enter a valid age"],
      max: [120, "Enter a valid age"],
    },

    relationToElder: {
      type: String,
      required: [true, "Relationship to the elder is required"],
      trim: true,
    },

    healthCondition: {
      type: String,
      trim: true,
    },

    // Sensitive: only the vendor of the home, admin, manager and the
    // uploading user may see these (FR-26)
    reportImages: [{ type: String, trim: true }],

    contactPreference: {
      type: String,
      required: [true, "Contact preference is required"],
      enum: ["whatsapp", "phone", "email"],
    },

    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "new",
    },

  },

  { timestamps: true }

);


// =======================================
// INDEXES
// "my bookings", "bookings of this home", and the review check
// =======================================

bookingSchema.index({ user: 1 });

bookingSchema.index({ home: 1, status: 1 });


const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;