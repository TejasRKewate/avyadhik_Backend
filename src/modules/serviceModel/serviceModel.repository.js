import ServiceModel from "./serviceModel.model.js";


// =======================================
// SERVICE MODEL REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================


// All service models, A to Z
export const findAll = () => {

  return ServiceModel.find().sort({ name: 1 });

};


// One service model by id
export const findById = (id) => {

  return ServiceModel.findById(id);

};


// One service model by slug (used to check for duplicates)
export const findBySlug = (slug) => {

  return ServiceModel.findOne({ slug });

};


// Create a service model
export const createServiceModel = (data) => {

  return ServiceModel.create(data);

};


// Update a service model and return the NEW version.
// runValidators makes the model's rules apply on updates too
// (they are skipped by default).
export const updateById = (id, data) => {

  return ServiceModel.findByIdAndUpdate(id, data, {

    new: true,

    runValidators: true,

  });

};


// Delete a service model and return the deleted document
// (null if not found)
export const deleteById = (id) => {

  return ServiceModel.findByIdAndDelete(id);

};