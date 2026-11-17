
import path from "path";
import mongoose from "mongoose";

import * as bookingRepository from "./booking.repository.js";
import Home from "../home/home.model.js";


// =======================================
// HELPERS
// =======================================

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const roleOf = (user) => String(user.role || "").trim().toLowerCase();

const assertValidId = (id, label = "id") => {
  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, `Invalid ${label}`);
  }
};

// Can this user open this booking? (FR-23, FR-24, FR-25, section 6)
// booking.home must be populated (the repository does this).
const canAccessBooking = (user, booking) => {
  const role = roleOf(user);

  if (role === "admin" || role === "manager") return true;

  if (role === "user") {
    return String(booking.user?._id || booking.user) === String(user._id);
  }

  if (role === "vendor") {
    // booking.home is null if the home was deleted
    return (
      booking.home &&
      String(booking.home.vendor) === String(user._id)
    );
  }

  // viewer and anything else: no access
  return false;
};

// Always answer 404 (not 403) for a booking the user may not open,
// so a vendor cannot find out which ids exist by changing the URL.
const getAccessibleBooking = async (user, id) => {
  assertValidId(id, "booking id");

  const booking = await bookingRepository.findById(id);

  if (!booking || !canAccessBooking(user, booking)) {
    throw httpError(404, "Booking not found");
  }

  return booking;
};


// =======================================
// CREATE BOOKING (FR-17 to FR-20, FR-38, FR-39)
// userId comes from the JWT, never from req.body.
// Only the saved file NAMES are stored in reportImages.
// =======================================

export const createBooking = async (userId, body, files = []) => {

  // FR-39: the home must exist before a booking is created
  const homeExists = await Home.exists({ _id: body.home });

  if (!homeExists) {
    throw httpError(404, "Home not found");
  }

  const booking = await bookingRepository.create({
    user: userId,
    home: body.home,
    elderName: body.elderName,
    elderAge: body.elderAge,
    relationToElder: body.relationToElder,
    healthCondition: body.healthCondition || undefined,
    contactPreference: body.contactPreference,
    reportImages: files.map((file) => file.filename),
  });

  return bookingRepository.findById(booking._id);
};


// =======================================
// LIST BOOKINGS (FR-23, FR-24, FR-25)
// Admin / Manager : all bookings
// Vendor          : bookings of homes they own
// User            : their own bookings
// =======================================

export const getBookings = async (user, query = {}) => {

  const role = roleOf(user);
  const filter = {};

  if (role === "user") {
    filter.user = user._id;
  }

  else if (role === "vendor") {
    const homeIds = await bookingRepository.findHomeIdsByVendor(user._id);
    filter.home = { $in: homeIds };
  }

  else if (role !== "admin" && role !== "manager") {
    throw httpError(403, "Access Denied");
  }

  if (query.status) {
    filter.status = query.status;
  }

  return bookingRepository.findPaginated(filter, {
    page: query.page,
    limit: query.limit,
  });
};


// =======================================
// GET ONE BOOKING
// =======================================

export const getBookingById = async (user, id) => {
  return getAccessibleBooking(user, id);
};


// =======================================
// UPDATE STATUS (FR-24, FR-27)
// Admin / Manager : any booking
// Vendor          : only bookings of their own homes
// A User cannot change a status.
// =======================================

export const updateBookingStatus = async (user, id, status) => {

  const role = roleOf(user);

  if (role !== "admin" && role !== "manager" && role !== "vendor") {
    throw httpError(403, "Access Denied");
  }

  // For a vendor this also checks that the booking belongs to their home
  await getAccessibleBooking(user, id);

  return bookingRepository.updateStatus(id, status);
};


// =======================================
// HEALTH REPORT FILE (FR-26)
// Returns the full path of one report image, but only for people
// allowed to see it. Used later by the protected report route.
// The file name must be listed on the booking, which also blocks
// path tricks such as "../../app.js".
// =======================================

export const getReportFilePath = async (user, id, filename) => {

  const booking = await getAccessibleBooking(user, id);

  if (!booking.reportImages.includes(filename)) {
    throw httpError(404, "Report not found");
  }

  return path.join(
    process.cwd(),
    "private-uploads",
    "health-reports",
    path.basename(filename)
  );
};