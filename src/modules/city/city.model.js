import mongoose from "mongoose";


const citySchema = new mongoose.Schema(

  {

    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    icon: {
      type: String, // image URL
      trim: true,
    },

    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"],
    },

    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"],
    },

  },

  { timestamps: true }

);


const City = mongoose.model("City", citySchema);

export default City;