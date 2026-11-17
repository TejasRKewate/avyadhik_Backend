import User from "./user.model.js";


// =======================================
// USER REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================


// Find a user by email (password NOT included)
export const findByEmail = (email) => {

  return User.findOne({ email });

};


// Find a user by email WITH the password hash.
// Needed only at login, because the model has select: false
export const findByEmailWithPassword = (email) => {

  return User.findOne({ email }).select("+password");

};


// Find a user by id (password NOT included)
export const findById = (id) => {

  return User.findById(id);

};


// Create a user.
// The password is hashed by the pre("save") hook in the model.
export const createUser = (data) => {

  return User.create(data);

};