import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(

  {

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false
    },
    verificationOtp: {
      type: String,
      default: null
    },
    verificationOtpExpiry: {
      type: Date,
      default: null
    },
    forgetPasswordOtp: {
      type: String,
      default: null
    },
    forgetPasswordOtpExpiry: {
      type: Date,
      default: null
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // not returned in queries unless you ask for it
    },

    role: {
      type: String,
      enum: ["admin", "manager", "viewer", "vendor", "user"],
      default: "user",
    },

  },

  { timestamps: true }

);


// =======================================
// HASH PASSWORD BEFORE SAVING
// (only when the password was changed)
// =======================================

userSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);

});


// =======================================
// COMPARE PASSWORD (used at login)
// =======================================

userSchema.methods.comparePassword = function (plainPassword) {

  return bcrypt.compare(plainPassword, this.password);

};


const User = mongoose.model("User", userSchema);

export default User;