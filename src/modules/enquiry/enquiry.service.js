import * as enquiryRepository from "./enquiry.repository.js";

// CHECK THIS PATH AND NAME: it must match your ServiceModel module's
// repository file and its find-by-id function.
import * as serviceModelRepository from "../serviceModel/serviceModel.repository.js";


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
// CREATE ENQUIRY (public)
// Only the listed fields are copied from the body.
// status is never taken from the visitor:
// the model default ("new") applies.
// =======================================

export const createEnquiry = async (body) => {

  // MongoDB does not enforce references, so check it ourselves
  const serviceModel = await serviceModelRepository.findById(

    body.supportNeeded

  );

  if (!serviceModel) {

    throw createError(400, "Selected support type does not exist");

  }

  return enquiryRepository.createEnquiry({

    state: body.state,

    cityOrArea: body.cityOrArea,

    lookingFor: body.lookingFor,

    supportNeeded: body.supportNeeded,

    monthlyBudget: body.monthlyBudget,

    name: body.name,

    phone: normalizePhone(body.phone),

    email: body.email,

    consent: body.consent,

  });

};


// =======================================
// LIST ENQUIRIES (admin / manager)
// =======================================

export const getEnquiries = async ({ status, page, limit }) => {

  const filter = status ? { status } : {};

  const skip = (page - 1) * limit;

  const [enquiries, total] = await Promise.all([

    enquiryRepository.findAll(filter, skip, limit),

    enquiryRepository.countAll(filter),

  ]);

  return {

    enquiries,

    total,

    page,

    pages: Math.ceil(total / limit),

  };

};


// =======================================
// GET ONE ENQUIRY (admin / manager)
// =======================================

export const getEnquiryById = async (id) => {

  const enquiry = await enquiryRepository.findById(id);

  if (!enquiry) {

    throw createError(404, "Enquiry not found");

  }

  return enquiry;

};


// =======================================
// UPDATE STATUS (admin / manager)
// =======================================

export const updateEnquiryStatus = async (id, status) => {

  const enquiry = await enquiryRepository.updateStatusById(id, status);

  if (!enquiry) {

    throw createError(404, "Enquiry not found");

  }

  return enquiry;

};