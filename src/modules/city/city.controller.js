import mongoose from "mongoose";

import * as cityService from "./city.service.js";


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

      message: "Invalid city id",

    });

    return true;

  }

  return false;

};


// =======================================
// LIST CITIES (FR-5)
// GET /  (public)
// =======================================

export const getCities = async (req, res) => {

  try {

    const cities = await cityService.getCities();

    return res.status(200).json({

      success: true,

      count: cities.length,

      data: { cities },

    });

  }

  catch (err) {

    return handleError(res, err, "GET CITIES");

  }

};


// =======================================
// GET ONE CITY
// GET /:id  (public)
// =======================================

export const getCityById = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const city = await cityService.getCityById(req.params.id);

    return res.status(200).json({

      success: true,

      data: { city },

    });

  }

  catch (err) {

    return handleError(res, err, "GET CITY");

  }

};


// =======================================
// CREATE CITY
// POST /  (admin only)
// Body: name, slug (optional), icon (optional), latitude, longitude
// =======================================

export const createCity = async (req, res) => {

  try {

    const city = await cityService.createCity(req.body);

    return res.status(201).json({

      success: true,

      message: "City created",

      data: { city },

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE CITY");

  }

};


// =======================================
// UPDATE CITY
// PUT /:id  (admin only)
// =======================================

export const updateCity = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const city = await cityService.updateCity(req.params.id, req.body);

    return res.status(200).json({

      success: true,

      message: "City updated",

      data: { city },

    });

  }

  catch (err) {

    return handleError(res, err, "UPDATE CITY");

  }

};


// =======================================
// DELETE CITY
// DELETE /:id  (admin only)
// =======================================

export const deleteCity = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    await cityService.deleteCity(req.params.id);

    return res.status(200).json({

      success: true,

      message: "City deleted",

    });

  }

  catch (err) {

    return handleError(res, err, "DELETE CITY");

  }

};