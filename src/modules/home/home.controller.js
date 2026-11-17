import * as homeService from "./home.service.js";


// =======================================
// HELPERS
// =======================================


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
// ADMIN: LIST ALL HOMES (listed and unlisted)
// GET /admin  (admin only)
// Query: isListed, page, limit
// =======================================

export const getAllHomesAdmin = async (req, res) => {

  try {

    const result = await homeService.getAllHomesForAdmin(req.validatedQuery);

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

    return handleError(res, err, "GET ALL HOMES (ADMIN)");

  }

};


// =======================================
// ADMIN: GET ONE HOME (listed or unlisted)
// GET /admin/:id  (admin only)
// =======================================

export const getHomeAdmin = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const home = await homeService.getHomeForAdmin(req.params.id);

    return res.status(200).json({

      success: true,

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "GET HOME (ADMIN)");

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
// The whole user is passed, so the service can tell an admin from a vendor.
// =======================================

export const createHome = async (req, res) => {

  try {

    const home = await homeService.createHome(

      req.body,

      req.user,

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


// =======================================
// ADMIN: LIST OR UNLIST A HOME
// PATCH /:id/listing  (admin only)
// Body: { "isListed": true | false }
// =======================================

export const setListing = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const home = await homeService.setListing(

      req.params.id,

      req.body.isListed

    );

    return res.status(200).json({

      success: true,

      message: home.isListed ? "Home listed" : "Home unlisted",

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "SET LISTING");

  }

};


// =======================================
// ADMIN: ADD IMAGES
// POST /:id/images  (admin only)  multipart/form-data
// Image field name: images
// =======================================

export const addHomeImages = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const home = await homeService.addImages(req.params.id, req.files);

    return res.status(200).json({

      success: true,

      message: "Images added",

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "ADD HOME IMAGES");

  }

};


// =======================================
// ADMIN: REMOVE IMAGES
// DELETE /:id/images  (admin only)
// Body: { "images": ["/uploads/homes/a.jpg"] }
// =======================================

export const removeHomeImages = async (req, res) => {

  try {

    if (sendIfInvalidId(res, req.params.id)) return;

    const home = await homeService.removeImages(

      req.params.id,

      req.body.images

    );

    return res.status(200).json({

      success: true,

      message: "Images removed",

      data: { home },

    });

  }

  catch (err) {

    return handleError(res, err, "REMOVE HOME IMAGES");

  }

};