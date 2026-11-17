import Amenity from "./amenity.model.js";


// =======================================
// AMENITY REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================


// All amenities, grouped by category and then A to Z.
// If a category is given, only that category is returned.
export const findAll = (category) => {

  const filter = category ? { category } : {};

  return Amenity.find(filter).sort({ category: 1, name: 1 });

};


// One amenity by id
export const findById = (id) => {

  return Amenity.findById(id);

};


// One amenity by name + category (used to check for duplicates).
// The collation makes the name match ignore upper/lower case,
// so "Yoga" and "yoga" count as the same amenity.
export const findByNameAndCategory = (name, category) => {

  return Amenity.findOne({ name, category }).collation({

    locale: "en",

    strength: 2,

  });

};


// Create an amenity
export const createAmenity = (data) => {

  return Amenity.create(data);

};


// Update an amenity and return the NEW version.
// runValidators makes the model's rules (like the category list)
// apply on updates too (they are skipped by default).
export const updateById = (id, data) => {

  return Amenity.findByIdAndUpdate(id, data, {

    new: true,

    runValidators: true,

  });

};


// Delete an amenity and return the deleted document
// (null if not found)
export const deleteById = (id) => {

  return Amenity.findByIdAndDelete(id);

};