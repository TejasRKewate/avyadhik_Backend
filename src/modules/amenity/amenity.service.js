import * as amenityRepository from "./amenity.repository.js";
import * as homeRepository from "../home/home.repository.js";


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


const DUPLICATE_MESSAGE =

  "An amenity with this name already exists in this category";


// =======================================
// LIST AMENITIES
// category is optional (undefined means all categories)
// =======================================

export const getAmenities = async (category) => {

  return amenityRepository.findAll(category);

};


// =======================================
// GET ONE AMENITY
// =======================================

export const getAmenityById = async (id) => {

  const amenity = await amenityRepository.findById(id);

  if (!amenity) {

    throw createError(404, "Amenity not found");

  }

  return amenity;

};


// =======================================
// CREATE AMENITY
// The same name is allowed in a different category,
// but not twice in the same category.
// =======================================

export const createAmenity = async (body) => {

  const existing = await amenityRepository.findByNameAndCategory(

    body.name,

    body.category

  );

  if (existing) {

    throw createError(409, DUPLICATE_MESSAGE);

  }

  return amenityRepository.createAmenity(body);

};


// =======================================
// UPDATE AMENITY
// =======================================

export const updateAmenity = async (id, body) => {

  const amenity = await amenityRepository.findById(id);

  if (!amenity) {

    throw createError(404, "Amenity not found");

  }

  // Check the final name + category after the update.
  // Fields that were not sent keep their current value.
  if (body.name !== undefined || body.category !== undefined) {

    const name = body.name !== undefined ? body.name : amenity.name;

    const category =

      body.category !== undefined ? body.category : amenity.category;

    const other = await amenityRepository.findByNameAndCategory(

      name,

      category

    );

    // Another amenity (not this one) must not already use this pair
    if (other && String(other._id) !== String(id)) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

  }

  return amenityRepository.updateById(id, body);

};


// =======================================
// DELETE AMENITY
// Refused with 409 if any home still uses this amenity
// (MongoDB does not enforce references, section 6).
// =======================================

export const deleteAmenity = async (id) => {

  const amenity = await amenityRepository.findById(id);

  if (!amenity) {

    throw createError(404, "Amenity not found");

  }

  if (await homeRepository.existsByAmenity(id)) {

    throw createError(

      409,

      "This amenity cannot be deleted because homes still use it"

    );

  }

  await amenityRepository.deleteById(id);

  return amenity;

};