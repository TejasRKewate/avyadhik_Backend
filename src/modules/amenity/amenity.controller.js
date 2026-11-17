import mongoose from "mongoose";

import * as amenityService from "./amenity.service.js";


// Same list as the model's enum
const CATEGORIES = ["lifestyle", "medical", "services", "community"];


// =======================================
// HELPERS
// =======================================

// Service errors carry a statusCode (404, 409, ...).
// Anything else is an unexpected 500.
const handleError = (res, err, label) => {

  if (err.statusCode) {

    return res.status(err.statusCode).json({

      success: false,

      message: err.message,

    });

  }

  console.error(`${label} ERROR:`, err);

  return res.status(500).json({

    success: false,

    message: "Something went wrong",

  });

};


// Joi only checks req.body, so the :id in the URL is checked here.
// Returns true if the id was bad (and the 400 response is already sent).
const sendIfInvalidId = (res, id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {

    res.status(400).json({

      success: false,

      message: "Invalid amenity id",

    });

    return true;

  }

  return false;

};


// =======================================
// LIST AMENITIES
// GET /  (public)
// Optional query: ?category=lifestyle|medical|services|community
// =======================================

export const getAmenities = async (req, res) => {

  try {

    const { category } = req.query;

    // The query string is user input: only accept one plain allowed value.
    if (category !== undefined && !CATEGORIES.includes(category)) {

      return res.status(400).json({

        success: false,

        message: `Category must be one of: ${CATEGORIES.join(", ")}`,

      });

    }

    const amenities = await amenityService.getAmenities(category);

    return res.status(200).json({

      success: true,

      count: amenities.length,

      data: { amenities },

    });

  }

  catch (err) {

    return handleError(res, err, "GET AMENITIES");

  }

};


// =======================================
// GET ONE AMENITY
// GET /:id  (public)
// =======================================

export const getAmenityById = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const amenity = await amenityService.getAmenityById(req.params.id);

    return res.status(200).json({

      success: true,

      data: { amenity },

    });

  }

  catch (err) {

    return handleError(res, err, "GET AMENITY");

  }

};


// =======================================
// CREATE AMENITY
// POST /  (admin only)
// Body: name, category, icon (optional)
// =======================================

export const createAmenity = async (req, res) => {

  try {

    const amenity = await amenityService.createAmenity(req.body);

    return res.status(201).json({

      success: true,

      message: "Amenity created",

      data: { amenity },

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE AMENITY");

  }

};


// =======================================
// UPDATE AMENITY
// PUT /:id  (admin only)
// =======================================

export const updateAmenity = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const amenity = await amenityService.updateAmenity(

      req.params.id,

      req.body

    );

    return res.status(200).json({

      success: true,

      message: "Amenity updated",

      data: { amenity },

    });

  }

  catch (err) {

    return handleError(res, err, "UPDATE AMENITY");

  }

};


// =======================================
// DELETE AMENITY
// DELETE /:id  (admin only)
// =======================================

export const deleteAmenity = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    await amenityService.deleteAmenity(req.params.id);

    return res.status(200).json({

      success: true,

      message: "Amenity deleted",

    });

  }

  catch (err) {

    return handleError(res, err, "DELETE AMENITY");

  }

};