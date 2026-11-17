

import * as bookingService from "./booking.service.js";


// =======================================
// ERROR HANDLER
// Errors thrown by the service carry a statusCode (400, 403, 404...).
// Anything else is an unexpected error and becomes a 500.
// =======================================

const handleError = (res, error, label) => {

  if (error.statusCode) {

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

  }

  console.error(`${label} ERROR:`, error);

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });

};


// =======================================
// CREATE BOOKING
// POST /api/bookings   (role: user)
// multipart/form-data, file field: reportImages
// =======================================

export const createBooking = async (req, res) => {

  try {

    const booking = await bookingService.createBooking(
      req.user._id,
      req.body,
      req.files || []
    );

    return res.status(201).json({
      success: true,
      message: "Booking request sent successfully",
      data: booking,
    });

  } catch (error) {

    return handleError(res, error, "CREATE BOOKING");

  }

};


// =======================================
// LIST BOOKINGS
// GET /api/bookings   (role: admin, manager, vendor, user)
// =======================================

export const getBookings = async (req, res) => {

  try {

    const result = await bookingService.getBookings(
      req.user,
      req.validatedQuery
    );

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: result,
    });

  } catch (error) {

    return handleError(res, error, "GET BOOKINGS");

  }

};


// =======================================
// GET ONE BOOKING
// GET /api/bookings/:id
// =======================================

export const getBookingById = async (req, res) => {

  try {

    const booking = await bookingService.getBookingById(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      data: booking,
    });

  } catch (error) {

    return handleError(res, error, "GET BOOKING");

  }

};


// =======================================
// UPDATE BOOKING STATUS
// PATCH /api/bookings/:id/status   (role: admin, manager, vendor)
// =======================================

export const updateBookingStatus = async (req, res) => {

  try {

    const booking = await bookingService.updateBookingStatus(
      req.user,
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });

  } catch (error) {

    return handleError(res, error, "UPDATE BOOKING STATUS");

  }

};


// =======================================
// DOWNLOAD / VIEW A HEALTH REPORT IMAGE (FR-26)
// GET /api/bookings/:id/reports/:filename
// Only the vendor of the home, admin, manager and the booking's
// own user can open it. The file is never served as a public URL.
// =======================================

export const getHealthReport = async (req, res) => {

  try {

    const filePath = await bookingService.getReportFilePath(
      req.user,
      req.params.id,
      req.params.filename
    );

    return res.sendFile(filePath, (err) => {

      if (err && !res.headersSent) {

        res.status(404).json({
          success: false,
          message: "Report not found",
        });

      }

    });

  } catch (error) {

    return handleError(res, error, "GET HEALTH REPORT");

  }

};