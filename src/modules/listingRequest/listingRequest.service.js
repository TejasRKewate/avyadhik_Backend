import * as listingRequestRepository from "./listingRequest.repository.js";


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


// "+91 98765-43210" or "9876543210" -> "9876543210"
// The model stores the 10 digits only, without +91.
const normalizePhone = (phone) => {

  return phone.replace(/\D/g, "").slice(-10);

};


// =======================================
// CREATE LISTING REQUEST (public)
// Only the listed fields are copied from the body.
// status and home are never taken from the visitor:
// the model defaults ("new", null) apply.
// =======================================

export const createListingRequest = async (body) => {

  return listingRequestRepository.createListingRequest({

    propertyName: body.propertyName,

    operatorName: body.operatorName,

    email: body.email,

    phone: normalizePhone(body.phone),

    city: body.city,

    careTypes: body.careTypes,

    websiteUrl: body.websiteUrl || "",

    message: body.message || "",

    consent: body.consent,

  });

};


// =======================================
// LIST LISTING REQUESTS (admin / manager)
// =======================================

export const getListingRequests = async ({ status, page, limit }) => {

  const filter = status ? { status } : {};

  const skip = (page - 1) * limit;

  const [listingRequests, total] = await Promise.all([

    listingRequestRepository.findAll(filter, skip, limit),

    listingRequestRepository.countAll(filter),

  ]);

  return {

    listingRequests,

    total,

    page,

    pages: Math.ceil(total / limit),

  };

};


// =======================================
// GET ONE LISTING REQUEST (admin / manager)
// =======================================

export const getListingRequestById = async (id) => {

  const listingRequest = await listingRequestRepository.findById(id);

  if (!listingRequest) {

    throw createError(404, "Listing request not found");

  }

  return listingRequest;

};


// =======================================
// UPDATE STATUS (admin / manager)
// =======================================

export const updateListingRequestStatus = async (id, status) => {

  const listingRequest = await listingRequestRepository.updateStatusById(

    id,

    status

  );

  if (!listingRequest) {

    throw createError(404, "Listing request not found");

  }

  return listingRequest;

};