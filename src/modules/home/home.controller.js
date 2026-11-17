import * as homeService from "./home.service.js";


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

// Returns true if the id was bad (and the 400 response is already sent).
// A 24-character hex check, so 12-character text is not accepted as an id.
const sendIfInvalidId = (res, id) => {

  if (!/^[a-f0-9]{24}$/i.test(id)) {

    res.status(400).json({

      success: false,

      message: "Invalid home id",

    });

    return true;

  }

  return false;

};


// =======================================
// LIST / SEARCH HOMES (FR-8, FR-30 to FR-37)
// GET /  (public)
// Query: city, location, serviceModel, lengthOfStay, roomType,
//        minRating, facilities, page, limit
// =======================================

export const getHomes = async (req, res) => {

  try {

    // validateQuery puts the checked query here
    const result = await homeService.searchHomes(req.validatedQuery);

    return res.status(200).json({

      success: true,

      count: result.homes.length,

      total: result.total,

      page: result.page,

      pages: result.pages,

      data: { homes: result.homes },

    });

  }

  catch (err) {

    return handleError(res, err, "GET HOMES");

  }

};


// =======================================
// MY HOMES (FR-40)
// GET /mine  (vendor only)
// =======================================

export const getMyHomes = async (req, res) => {

  try {

    const homes = await homeService.getMyHomes(req.user._id);

    return res.status(200).json({

      success: true,

      count: homes.length,

      data: { homes },

    });

  }

  catch (err) {

    return handleError(res, err, "GET MY HOMES");

  }

};


// =======================================
// GET ONE HOME (FR-10, FR-11)
// GET /:idOrSlug  (public)
// =======================================

export const getHome = async (req, res) => {

  try {

    const home = await homeService.getHome(req.params.idOrSlug);

    return res.status(200).json({

      success: true,

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "GET HOME");

  }

};


// =======================================
// CREATE HOME (FR-14)
// POST /  (vendor, admin)  multipart/form-data
// Image field name: images
// =======================================

export const createHome = async (req, res) => {

  try {

    const home = await homeService.createHome(

      req.body,

      req.user._id,

      req.files

    );

    return res.status(201).json({

      success: true,

      message: "Home registered",

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE HOME");

  }

};


// =======================================
// UPDATE HOME
// PUT /:id  (admin, manager)
// =======================================

export const updateHome = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const home = await homeService.updateHome(req.params.id, req.body);

    return res.status(200).json({

      success: true,

      message: "Home updated",

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "UPDATE HOME");

  }

};