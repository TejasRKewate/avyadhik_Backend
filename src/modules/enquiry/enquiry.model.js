import mongoose from "mongoose";


// =======================================
// FIXED LISTS
// =======================================

// States and union territories (as on the reference site, including Delhi NCR)
export const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const LOOKING_FOR = [
  "parent",             // My mother or father
  "spouse",             // My spouse
  "self",               // Myself
  "relative or friend", // A relative or friend
];

export const MONTHLY_BUDGETS = [
  "still exploring",
  "under 75000",
  "75000-125000",
  "125000-200000",
  "above 200000",
];

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "shortlist sent",
  "closed",
];


const enquirySchema = new mongoose.Schema(

  {

    // ---------- Step 1: location ----------

    state: {
      type: String,
      required: [true, "State or union territory is required"],
      enum: {
        values: STATES,
        message: "Please select a valid state or union territory",
      },
    },

    cityOrArea: {
      type: String,
      required: [true, "City or preferred area is required"],
      trim: true,
      maxlength: [100, "City or area is too long"],
    },


    // ---------- Step 2: needs ----------

    lookingFor: {
      type: String,
      required: [true, "Please tell us who the home is for"],
      enum: {
        values: LOOKING_FOR,
        message: "Invalid value for who the home is for",
      },
    },

    // Type of care (the same list as ServiceModel)
    supportNeeded: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceModel",
      required: [true, "Support needed is required"],
    },

    monthlyBudget: {
      type: String,
      required: [true, "Monthly budget is required"],
      enum: {
        values: MONTHLY_BUDGETS,
        message: "Invalid monthly budget",
      },
      default: "still exploring",
    },


    // ---------- Step 3: contact ----------

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name is too long"],
    },

    // 10-digit Indian mobile number, without the +91
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // Must be true: agreed to be contacted and accepted the privacy policy
    consent: {
      type: Boolean,
      required: [true, "Consent is required"],
      validate: {
        validator: (value) => value === true,
        message: "You must agree to be contacted to submit this enquiry",
      },
    },


    // ---------- Handled by Admin / Manager ----------

    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: "new",
    },

  },

  { timestamps: true }

);


// =======================================
// INDEXES
// Admin / Manager list: filter by status, newest first
// =======================================

enquirySchema.index({ status: 1, createdAt: -1 });


const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;