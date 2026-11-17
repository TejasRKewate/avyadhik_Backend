import * as cityRepository from "./city.repository.js";
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


// "Gurgaon & Delhi NCR" -> "gurgaon-and-delhi-ncr"
const slugify = (text) => {

  return String(text)

    .trim()

    .toLowerCase()

    .replace(/&/g, " and ")

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-+|-+$/g, "");

};


// Builds a slug from the given slug, or from the name if no slug was given
const buildSlug = (slug, name) => {

  const result = slugify(slug || name);

  if (!result) {

    throw createError(400, "Could not create a slug from the given name");

  }

  return result;

};


const DUPLICATE_MESSAGE = "A city with this slug already exists";


// =======================================
// LIST CITIES (FR-5)
// =======================================

export const getCities = async () => {

  return cityRepository.findAll();

};


// =======================================
// GET ONE CITY
// =======================================

export const getCityById = async (id) => {

  const city = await cityRepository.findById(id);

  if (!city) {

    throw createError(404, "City not found");

  }

  return city;

};


// =======================================
// CREATE CITY
// =======================================

export const createCity = async (body) => {

  const slug = buildSlug(body.slug, body.name);

  const existing = await cityRepository.findBySlug(slug);

  if (existing) {

    throw createError(409, DUPLICATE_MESSAGE);

  }

  try {

    return await cityRepository.createCity({ ...body, slug });

  }

  catch (err) {

    // Two requests with the same slug at the same time:
    // the unique index rejects the second one.
    if (err.code === 11000) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

    throw err;

  }

};


// =======================================
// UPDATE CITY
// The slug changes only if the admin sends a new slug.
// Changing the name alone keeps the old slug, so links don't break.
// =======================================

export const updateCity = async (id, body) => {

  const city = await cityRepository.findById(id);

  if (!city) {

    throw createError(404, "City not found");

  }

  const data = { ...body };

  if (body.slug !== undefined) {

    data.slug = buildSlug(body.slug, body.name || city.name);

    // Another city must not already use this slug
    const other = await cityRepository.findBySlug(data.slug);

    if (other && String(other._id) !== String(id)) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

  }

  try {

    return await cityRepository.updateById(id, data);

  }

  catch (err) {

    if (err.code === 11000) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

    throw err;

  }

};


// =======================================
// DELETE CITY
// Refused with 409 if any home still uses this city
// (MongoDB does not enforce references, section 6).
// =======================================

export const deleteCity = async (id) => {

  const city = await cityRepository.findById(id);

  if (!city) {

    throw createError(404, "City not found");

  }

  if (await homeRepository.existsByCity(id)) {

    throw createError(

      409,

      "This city cannot be deleted because homes still use it"

    );

  }

  await cityRepository.deleteById(id);

  return city;

};