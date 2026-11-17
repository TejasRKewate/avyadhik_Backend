import mongoose from "mongoose";

import * as enquiryService from "./enquiry.service.js";

import { STATUSES } from "./enquiry.validation.js";


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

      message: "Invalid enquiry id",

    });

    return true;

  }

  return false;

};


// =======================================
// CREATE ENQUIRY
// POST /  (public, rate limited)
// The visitor's contact details are NOT sent back.
// =======================================

export const createEnquiry = async (req, res) => {

  try {

    await enquiryService.createEnquiry(req.body);

    return res.status(201).json({

      success: true,

      message: "Thank you! Our advisor will contact you soon.",

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE ENQUIRY");

  }

};


// =======================================
// LIST ENQUIRIES
// GET /  (admin, manager)
// Optional query: ?status=new&page=1&limit=20
// =======================================

export const getEnquiries = async (req, res) => {

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

    const result = await enquiryService.getEnquiries({

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

    return handleError(res, err, "GET ENQUIRIES");

  }

};


// =======================================
// GET ONE ENQUIRY
// GET /:id  (admin, manager)
// =======================================

export const getEnquiryById = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const enquiry = await enquiryService.getEnquiryById(req.params.id);

    return res.status(200).json({

      success: true,

      data: { enquiry },

    });

  }

  catch (err) {

    return handleError(res, err, "GET ENQUIRY");

  }

};


// =======================================
// UPDATE STATUS
// PATCH /:id/status  (admin, manager)
// =======================================

export const updateEnquiryStatus = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const enquiry = await enquiryService.updateEnquiryStatus(

      req.params.id,

      req.body.status

    );

    return res.status(200).json({

      success: true,

      message: "Enquiry status updated",

      data: { enquiry },

    });

  }

  catch (err) {

    return handleError(res, err, "UPDATE ENQUIRY STATUS");

  }

};