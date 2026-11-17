import Enquiry from "./enquiry.model.js";

// =======================================
// ENQUIRY REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================


// Create an enquiry
export const createEnquiry = (data) => {

  return Enquiry.create(data);

};


// One page of enquiries, newest first.
// filter is {} for all, or { status } for one status.
export const findAll = (filter, skip, limit) => {

  return Enquiry.find(filter)

    .populate("supportNeeded", "name")

    .sort({ createdAt: -1 })

    .skip(skip)

    .limit(limit);

};


// Total number of enquiries matching the filter (for pagination)
export const countAll = (filter) => {

  return Enquiry.countDocuments(filter);

};


// One enquiry by id
export const findById = (id) => {

  return Enquiry.findById(id).populate("supportNeeded", "name");

};


// Update the status and return the NEW version
// (null if not found)
export const updateStatusById = (id, status) => {

  return Enquiry.findByIdAndUpdate(

    id,

    { status },

    { new: true, runValidators: true }

  ).populate("supportNeeded", "name");

};