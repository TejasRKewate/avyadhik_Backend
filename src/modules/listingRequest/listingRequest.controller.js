import mongoose from "mongoose";

import * as listingRequestService from "./listingRequest.service.js";

import { STATUSES } from "./listingRequest.validation.js";


// =======================================
// HELPERS
// =======================================

// Service errors carry a statusCode (400, 404, ...).
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

      message: "Invalid listing request id",

    });

    return true;

  }

  return false;

};


// =======================================
// CREATE LISTING REQUEST
// POST /  (public, rate limited)
// The operator's contact details are NOT sent back.
// =======================================

export const createListingRequest = async (req, res) => {

  try {

    await listingRequestService.createListingRequest(req.body);

    return res.status(201).json({

      success: true,

      message: "Thank you! Our team will review your submission and contact you.",

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE LISTING REQUEST");

  }

};


// =======================================
// LIST LISTING REQUESTS
// GET /  (admin, manager)
// Optional query: ?status=new&page=1&limit=20
// =======================================

export const getListingRequests = async (req, res) => {

  try {

    const { status } = req.query;

    // The query string is user input: only accept one allowed value.
    if (status !== undefined && !STATUSES.includes(status)) {

      return res.status(400).json({

        success: false,

        message: `Status must be one of: ${STATUSES.join(", ")}`,

      });

    }

    // Keep page and limit in a safe range
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(

      Math.max(parseInt(req.query.limit, 10) || 20, 1),

      100

    );

    const result = await listingRequestService.getListingRequests({

      status,

      page,

      limit,

    });

    return res.status(200).json({

      success: true,

      data: result,

    });

  }

  catch (err) {

    return handleError(res, err, "GET LISTING REQUESTS");

  }

};


// =======================================
// GET ONE LISTING REQUEST
// GET /:id  (admin, manager)
// =======================================

export const getListingRequestById = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const listingRequest = await listingRequestService.getListingRequestById(

      req.params.id

    );

    return res.status(200).json({

      success: true,

      data: { listingRequest },

    });

  }

  catch (err) {

    return handleError(res, err, "GET LISTING REQUEST");

  }

};


// =======================================
// UPDATE STATUS
// PATCH /:id/status  (admin, manager)
// =======================================

export const updateListingRequestStatus = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const listingRequest = await listingRequestService.updateListingRequestStatus(

      req.params.id,

      req.body.status

    );

    return res.status(200).json({

      success: true,

      message: "Listing request status updated",

      data: { listingRequest },

    });

  }

  catch (err) {

    return handleError(res, err, "UPDATE LISTING REQUEST STATUS");

  }

};