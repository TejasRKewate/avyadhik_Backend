import mongoose from "mongoose";


// =======================================
// FIXED LISTS
// =======================================

export const FACILITIES = [
  "Geriatric nutrition",
  "24x7 medical assistance",
  "Holistic care",
  "Personal caregivers",
  "Rehabilitation",
  "Dementia care",
  "Post-operative care",
  "Parkinson's care",
];

export const LENGTH_OF_STAY = ["long-term", "short-stay", "respite"];

export const ROOM_TYPES = [
  "private suite",
  "companion room",
  "one-bedroom residence",
  "two-bedroom residence",
];


// =======================================
// SCORE FIELD (static for now, FR-12)
// =======================================

const scoreField = {
  type: Number,
  min: [0, "Score must be between 0 and 10"],
  max: [10, "Score must be between 0 and 10"],
  default: 0,
};


const homeSchema = new mongoose.Schema(

  {

    name: {
      type: String,
      required: [true, "Home name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
    },

    area: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // GeoJSON Point built from the vendor's latitude and longitude.
    // Note: GeoJSON order is [longitude, latitude].
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Location coordinates are required"],
        validate: {
          validator: function (c) {
            return (
              Array.isArray(c) &&
              c.length === 2 &&
              c[0] >= -180 && c[0] <= 180 &&
              c[1] >= -90 && c[1] <= 90
            );
          },
          message: "Coordinates must be [longitude, latitude] with valid values",
        },
      },
    },

    rentPerMonth: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [0, "Rent cannot be negative"],
    },

    // Type of care
    serviceModels: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceModel" },
    ],

    amenities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Amenity" },
    ],

    scores: {
      lifestyle: scoreField,
      medical: scoreField,
      services: scoreField,
      community: scoreField,
    },

    images: [{ type: String, trim: true }],

    // Many-to-one: one vendor can own many homes (no unique)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor is required"],
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // Added in v1.1 for the search filters
    lengthOfStay: [{ type: String, enum: LENGTH_OF_STAY }],

    roomTypes: [{ type: String, enum: ROOM_TYPES }],

    facilities: [{ type: String, enum: FACILITIES }],

  },

  { timestamps: true }

);


// =======================================
// INDEXES
// =======================================

// Needed for the 100 km radius search (FR-8)
homeSchema.index({ location: "2dsphere" });

// Listing filters and "my homes"
homeSchema.index({ city: 1 });

homeSchema.index({ vendor: 1 });


const Home = mongoose.model("Home", homeSchema);

export default Home;