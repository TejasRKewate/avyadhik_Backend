import * as serviceModelRepository from "./serviceModel.repository.js";
import * as homeRepository from "../home/home.repository.js";
import * as enquiryRepository from "../enquiry/enquiry.repository.js";


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


// "Post-operative care" -> "post-operative-care"
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


const DUPLICATE_MESSAGE = "A service model with this slug already exists";


// =======================================
// LIST SERVICE MODELS (FR-6)
// =======================================

export const getServiceModels = async () => {

  return serviceModelRepository.findAll();

};


// =======================================
// GET ONE SERVICE MODEL
// =======================================

export const getServiceModelById = async (id) => {

  const serviceModel = await serviceModelRepository.findById(id);

  if (!serviceModel) {

    throw createError(404, "Service model not found");

  }

  return serviceModel;

};


// =======================================
// CREATE SERVICE MODEL
// =======================================

export const createServiceModel = async (body) => {

  const slug = buildSlug(body.slug, body.name);

  const existing = await serviceModelRepository.findBySlug(slug);

  if (existing) {

    throw createError(409, DUPLICATE_MESSAGE);

  }

  try {

    return await serviceModelRepository.createServiceModel({

      ...body,

      slug,

    });

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
// UPDATE SERVICE MODEL
// The slug changes only if the admin sends a new slug.
// Changing the name alone keeps the old slug, so links don't break.
// =======================================

export const updateServiceModel = async (id, body) => {

  const serviceModel = await serviceModelRepository.findById(id);

  if (!serviceModel) {

    throw createError(404, "Service model not found");

  }

  const data = { ...body };

  if (body.slug !== undefined) {

    data.slug = buildSlug(body.slug, body.name || serviceModel.name);

    // Another service model must not already use this slug
    const other = await serviceModelRepository.findBySlug(data.slug);

    if (other && String(other._id) !== String(id)) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

  }

  try {

    return await serviceModelRepository.updateById(id, data);

  }

  catch (err) {

    if (err.code === 11000) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

    throw err;

  }

};


// =======================================
// DELETE SERVICE MODEL
// Refused with 409 if any home or enquiry still uses it
// (MongoDB does not enforce references, section 6).
// =======================================

export const deleteServiceModel = async (id) => {

  const serviceModel = await serviceModelRepository.findById(id);

  if (!serviceModel) {

    throw createError(404, "Service model not found");

  }

  if (await homeRepository.existsByServiceModel(id)) {

    throw createError(

      409,

      "This service model cannot be deleted because homes still use it"

    );

  }

  if (await enquiryRepository.existsBySupportNeeded(id)) {

    throw createError(

      409,

      "This service model cannot be deleted because enquiries still use it"

    );

  }

  await serviceModelRepository.deleteById(id);

  return serviceModel;

};