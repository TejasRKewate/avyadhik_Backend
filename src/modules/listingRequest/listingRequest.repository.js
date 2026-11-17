import ListingRequest from "./listingRequest.model.js";

// =======================================
// LISTING REQUEST REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================


// Create a listing request
export const createListingRequest = (data) => {

  return ListingRequest.create(data);

};


// One page of listing requests, newest first.
// filter is {} for all, or { status } for one status.
export const findAll = (filter, skip, limit) => {

  return ListingRequest.find(filter)

    .sort({ createdAt: -1 })

    .skip(skip)

    .limit(limit);

};


// Total number matching the filter (for pagination)
export const countAll = (filter) => {

  return ListingRequest.countDocuments(filter);

};


// One listing request by id
export const findById = (id) => {

  return ListingRequest.findById(id);

};


// Update the status and return the NEW version
// (null if not found)
export const updateStatusById = (id, status) => {

  return ListingRequest.findByIdAndUpdate(

    id,

    { status },

    { new: true, runValidators: true }

  );

};