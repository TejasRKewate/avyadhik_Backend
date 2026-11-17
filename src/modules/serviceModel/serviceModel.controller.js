import mongoose from "mongoose";

import * as serviceModelService from "./serviceModel.service.js";


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

      message: "Invalid service model id",

    });

    return true;

  }

  return false;

};


// =======================================
// LIST SERVICE MODELS (FR-6)
// GET /  (public)
// =======================================

export const getServiceModels = async (req, res) => {

  try {

    const serviceModels = await serviceModelService.getServiceModels();

    return res.status(200).json({

      success: true,

      count: serviceModels.length,

      data: { serviceModels },

    });

  }

  catch (err) {

    return handleError(res, err, "GET SERVICE MODELS");

  }

};


// =======================================
// GET ONE SERVICE MODEL
// GET /:id  (public)
// =======================================

export const getServiceModelById = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const serviceModel = await serviceModelService.getServiceModelById(

      req.params.id

    );

    return res.status(200).json({

      success: true,

      data: { serviceModel },

    });

  }

  catch (err) {

    return handleError(res, err, "GET SERVICE MODEL");

  }

};


// =======================================
// CREATE SERVICE MODEL
// POST /  (admin only)
// Body: name, slug (optional), icon (optional), description (optional)
// =======================================

export const createServiceModel = async (req, res) => {

  try {

    const serviceModel = await serviceModelService.createServiceModel(

      req.body

    );

    return res.status(201).json({

      success: true,

      message: "Service model created",

      data: { serviceModel },

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE SERVICE MODEL");

  }

};


// =======================================
// UPDATE SERVICE MODEL
// PUT /:id  (admin only)
// =======================================

export const updateServiceModel = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const serviceModel = await serviceModelService.updateServiceModel(

      req.params.id,

      req.body

    );

    return res.status(200).json({

      success: true,

      message: "Service model updated",

      data: { serviceModel },

    });

  }

  catch (err) {

    return handleError(res, err, "UPDATE SERVICE MODEL");

  }

};


// =======================================
// DELETE SERVICE MODEL
// DELETE /:id  (admin only)
// =======================================

export const deleteServiceModel = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    await serviceModelService.deleteServiceModel(req.params.id);

    return res.status(200).json({

      success: true,

      message: "Service model deleted",

    });

  }

  catch (err) {

    return handleError(res, err, "DELETE SERVICE MODEL");

  }

};