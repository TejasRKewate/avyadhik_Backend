import Home from "./home.model.js";

// Lookups on other collections. Model files are imported directly so this
// file does not depend on the export names of other repositories.
import City from "../city/city.model.js";
import ServiceModel from "../serviceModel/serviceModel.model.js";
import Amenity from "../amenity/amenity.model.js";


// =======================================
// HOME REPOSITORY
// Only database queries live here.
// No business rules, no req/res.
// =======================================

// Fields shown on a listing card (FR-9). The vendor is not included.
// "description" was added so the Browse cards can show a short summary.
const CARD_FIELDS =
  "name slug description city area rentPerMonth images scores averageRating reviewCount serviceModels lengthOfStay roomTypes";

// Adds the related documents the portfolio page needs (FR-10, FR-11).
// Only the vendor's name is exposed, never email or phone.
const withDetails = (query) => {

  return query

    .populate("city", "name slug")

    .populate("serviceModels", "name slug icon description")

    .populate("amenities", "name icon category")

    .populate("vendor", "name");

};


// ---------- Listing and search ----------

export const search = (filter, { skip, limit }) => {

  return Home.find(filter)

    .select(CARD_FIELDS)

    .populate("city", "name slug")

    .populate("serviceModels", "name slug")

    .sort({ createdAt: -1 })

    .skip(skip)

    .limit(limit);

};

export const count = (filter) => {

  return Home.countDocuments(filter);

};


// ---------- Single home ----------

export const findById = (id) => {

  return Home.findById(id);

};

export const findByIdWithDetails = (id) => {

  return withDetails(Home.findById(id));

};

export const findBySlugWithDetails = (slug) => {

  return withDetails(Home.findOne({ slug }));

};

export const findBySlug = (slug) => {

  return Home.findOne({ slug });

};

export const findByVendor = (vendorId) => {

  return Home.find({ vendor: vendorId })

    .select(CARD_FIELDS)

    .populate("city", "name slug")

    .sort({ createdAt: -1 });

};


// ---------- Write ----------

export const create = (data) => {

  return Home.create(data);

};

export const updateById = (id, data) => {

  return Home.findByIdAndUpdate(id, data, {

    new: true,

    runValidators: true,

  });

};


// ---------- Lookups on other collections ----------

export const findCityById = (id) => City.findById(id);

export const findCityBySlug = (slug) => City.findOne({ slug });

// Case-insensitive exact match on the city name
export const findCityByName = (name) => {

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return City.findOne({ name: new RegExp(`^${escaped}$`, "i") });

};

export const findServiceModelBySlug = (slug) => {

  return ServiceModel.findOne({ slug });

};

export const countServiceModels = (ids) => {

  return ServiceModel.countDocuments({ _id: { $in: ids } });

};

export const countAmenities = (ids) => {

  return Amenity.countDocuments({ _id: { $in: ids } });

};


// ---------- "In use" checks for deleting master data ----------
// Used by the City, ServiceModel and Amenity services.

export const existsByCity = (cityId) => {

  return Home.exists({ city: cityId });

};

export const existsByServiceModel = (serviceModelId) => {

  return Home.exists({ serviceModels: serviceModelId });

};

export const existsByAmenity = (amenityId) => {

  return Home.exists({ amenities: amenityId });

};