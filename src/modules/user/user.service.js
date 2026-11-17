import jwt from "jsonwebtoken";
const secretKey = "tejaskewate"

import * as userRepository from "./user.repository.js";
import { sendEmail } from "../../utils/sendEmail.js";
import verifyEmailTemplate from "../../utils/VerifyEmailTemplate.js";


// Roles a person may pick when registering themselves (FR-1)
const SELF_REGISTER_ROLES = ["user", "vendor"];

// Roles only the admin can create (FR-4)
const STAFF_ROLES = ["admin", "manager", "viewer"];


// =======================================
// HELPERS
// =======================================

// Error that carries an HTTP status code.
// The controller reads statusCode and sends it to the client.
const createError = (statusCode, message) => {

  const err = new Error(message);

  err.statusCode = statusCode;

  return err;

};


// Remove the password and other internal fields before returning a user
const toSafeUser = (user) => ({

  _id: user._id,

  name: user.name,

  email: user.email,

  phone: user.phone,

  role: user.role,

  createdAt: user.createdAt,

});


// The auth middleware reads decoded.id (it also accepts _id and userId)
const signToken = (user) => {

  return jwt.sign(

    { id: user._id, role: user.role },

    secretKey,

    { expiresIn: process.env.JWT_EXPIRE || "7d" }

  );

};


// Shared by register and createStaff.
// Checks the email is free, then creates the user.
const createAccount = async ({ name, email, phone, password, role }) => {

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await userRepository.findByEmail(normalizedEmail);

  if (existing) {

    throw createError(409, "Email is already registered");

  }

  try {

    return await userRepository.createUser({

      name,

      email: normalizedEmail,

      phone,

      password,

      role,

    });

  }

  catch (err) {

    // Two requests with the same email at the same time:
    // the unique index rejects the second one.
    if (err.code === 11000) {

      throw createError(409, "Email is already registered");

    }

    throw err;

  }

};


// =======================================
// REGISTER (FR-1)
// =======================================


export const registerUser = async (body) => {

  const role = body.role || "user";

  // Check public registration role
  if (!SELF_REGISTER_ROLES.includes(role)) {
    throw createError(403, "This role cannot be registered publicly");
  }

  // Create user
  const user = await createAccount({ ...body, role });

  // Email verification URL
  const verifyEmailUrl = `http://localhost:5173/verifyEmail?code=${user._id}`;

  // Send verification email
  const verifyEmail = await sendEmail({
    sendTo: user.email,
    subject: "Verify email from Avyadhik",
    html: verifyEmailTemplate({
      name: user.name,
      url: verifyEmailUrl
    })
  });

  console.log("Verification email:", verifyEmail);

  return {
    user: toSafeUser(user),
    token: signToken(user),
  };
};

// =======================================
// LOGIN (FR-2)
// =======================================

export const loginUser = async ({ email, password }) => {

  const user = await userRepository.findByEmailWithPassword(

    email.trim().toLowerCase()

  );

  // Same message for "no such email" and "wrong password",
  // so nobody can find out which emails exist.
  if (!user) {

    throw createError(401, "Invalid email or password");

  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {

    throw createError(401, "Invalid email or password");

  }

  return {

    user: toSafeUser(user),

    token: signToken(user),

  };

};


// =======================================
// CREATE STAFF (FR-4)
// Called only after verifyToken + allowRoles("admin")
// =======================================

export const createStaff = async (body) => {

  if (!STAFF_ROLES.includes(body.role)) {

    throw createError(400, "Role must be admin, manager or viewer");

  }

  const user = await createAccount(body);

  return toSafeUser(user);

};