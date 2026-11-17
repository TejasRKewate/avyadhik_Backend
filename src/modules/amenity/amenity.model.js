import mongoose from "mongoose";


const amenitySchema = new mongoose.Schema(

  {

    name: {
      type: String,
      required: [true, "Amenity name is required"],
      trim: true,
    },

    icon: {
      type: String, // image URL
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["lifestyle", "medical", "services", "community"],
    },

  },

  { timestamps: true }

);


const Amenity = mongoose.model("Amenity", amenitySchema);

export default Amenity;