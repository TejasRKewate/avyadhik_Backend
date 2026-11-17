import City from "./city.model.js";


// =======================================
// CITY REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================


// All cities, A to Z
export const findAll = () => {

  return City.find().sort({ name: 1 });

};


// One city by id
export const findById = (id) => {

  return City.findById(id);

};


// One city by slug (used to check for duplicates)
export const findBySlug = (slug) => {

  return City.findOne({ slug });

};


// Create a city
export const createCity = (data) => {

  return City.create(data);

};


// Update a city and return the NEW version.
// runValidators makes the model's latitude/longitude limits
// apply on updates too (they are skipped by default).
export const updateById = (id, data) => {

  return City.findByIdAndUpdate(id, data, {

    new: true,

    runValidators: true,

  });

};


// Delete a city and return the deleted document (null if not found)
export const deleteById = (id) => {

  return City.findByIdAndDelete(id);

};