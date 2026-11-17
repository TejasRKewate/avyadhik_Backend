import mongoose from "mongoose";


const serviceModelSchema = new mongoose.Schema(

  {

    name: {
      type: String,
      required: [true, "Service model name is required"],
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

    description: {
      type: String, // shown on the service-model page (FR-6)
      trim: true,
    },

  },

  { timestamps: true }

);


const ServiceModel = mongoose.model("ServiceModel", serviceModelSchema);

export default ServiceModel;