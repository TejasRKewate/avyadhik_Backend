import fs from "fs/promises";
import path from "path";

import * as homeRepository from "./home.repository.js";
import * as userRepository from "../user/user.repository.js";
import * as listingRequestRepository from "../listingRequest/listingRequest.repository.js";


// =======================================
// HELPERS
// =======================================

const createError = (statusCode, message) => {

  const err = new Error(message);

  err.statusCode = statusCode;

  return err;

};

const slugify = (text) => {

  return String(text)

    .trim()

    .toLowerCase()

    .replace(/&/g, " and ")

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-+|-+$/g, "");

};

// A 24-character hex string is an id, anything else is treated as a slug.
// (mongoose's isValid is not used: it also accepts any 12-character text.)
const looksLikeId = (value) => /^[a-f0-9]{24}$/i.test(value);

// FR-8: fixed radius
const SEARCH_RADIUS_KM = 100;

const EARTH_RADIUS_KM = 6378.1;

// Slugs that would clash with a fixed route such as GET /homes/mine
// ("admin" was added for GET /homes/admin)
const RESERVED_SLUGS = ["mine", "admin"];

// A home can have at most this many photos
const MAX_IMAGES = 10;

// Public folder where the uploaded photos are stored
const IMAGE_URL_PREFIX = "/uploads/homes/";

// GeoJSON order is [longitude, latitude]
const toPoint = (latitude, longitude) => ({

  type: "Point",

  coordinates: [longitude, latitude],

});

const DUPLICATE_MESSAGE = "A home with this slug already exists";

// Fields an admin or manager may correct (the slug never changes)
const EDITABLE_FIELDS = [
  "name",
  "description",
  "address",
  "area",
  "city",
  "rentPerMonth",
  "serviceModels",
  "amenities",
  "lengthOfStay",
  "roomTypes",
  "facilities",
];


// MongoDB does not enforce references, so check that they exist (section 6).
// Returns the City document when a city was given.
const assertReferencesExist = async ({ city, serviceModels, amenities }) => {

  let cityDoc = null;

  if (city !== undefined) {

    cityDoc = await homeRepository.findCityById(city);

    if (!cityDoc) throw createError(400, "City not found");

  }

  if (serviceModels !== undefined) {

    const found = await homeRepository.countServiceModels(serviceModels);

    if (found !== serviceModels.length) {

      throw createError(400, "One or more service models were not found");

    }

  }

  if (amenities !== undefined && amenities.length > 0) {

    const found = await homeRepository.countAmenities(amenities);

    if (found !== amenities.length) {

      throw createError(400, "One or more amenities were not found");

    }

  }

  return cityDoc;

};


// "sunrise-care" -> "sunrise-care-pune" -> "sunrise-care-pune-2" ...
const buildUniqueSlug = async (name, citySlug) => {

  const base = slugify(name);

  if (!base) {

    throw createError(400, "Could not create a slug from the home name");

  }

  // A reserved slug is never used on its own
  const candidates = RESERVED_SLUGS.includes(base)

    ? [`${base}-${citySlug}`]

    : [base, `${base}-${citySlug}`];

  for (const candidate of candidates) {

    if (!(await homeRepository.findBySlug(candidate))) return candidate;

  }

  for (let i = 2; i <= 50; i++) {

    const candidate = `${base}-${citySlug}-${i}`;

    if (!(await homeRepository.findBySlug(candidate))) return candidate;

  }

  throw createError(409, "Could not create a unique slug for this home");

};

// Adds the four amenity tabs (FR-11) to a populated home
const withAmenitiesByCategory = (home) => {

  // FR-11: four tabs, one per amenity category
  const amenitiesByCategory = {

    lifestyle: [],

    medical: [],

    services: [],

    community: [],

  };

  home.amenities.forEach((amenity) => {

    if (amenitiesByCategory[amenity.category]) {

      amenitiesByCategory[amenity.category].push(amenity);

    }

  });

  return { ...home.toObject(), amenitiesByCategory };

};

// Deletes the photo files from disk. A file that is already gone
// (or cannot be deleted) must not fail the request, so errors are ignored.
const deleteImageFiles = async (urls) => {

  await Promise.all(

    urls

      .filter((url) => url.startsWith(IMAGE_URL_PREFIX))

      .map((url) =>

        fs

          .unlink(path.join(process.cwd(), "uploads", "homes", path.basename(url)))

          .catch(() => { })

      )

  );

};


// =======================================
// SEARCH HOMES (FR-8, FR-9, FR-30 to FR-37)
// A home must match every filter that is set.
// Only listed homes are returned.
// =======================================

export const searchHomes = async (query) => {

  const { page, limit } = query;

  // Unlisted homes never appear on the public site
  const filter = { isListed: true };

  // FR-30: homes in the selected city
  if (query.city) {

    const city = await homeRepository.findCityBySlug(query.city);

    if (!city) throw createError(404, "City not found");

    filter.city = city._id;

  }

  // FR-8: homes within 100 km of the typed location
  if (query.location) {

    const city = await homeRepository.findCityByName(query.location);

    if (!city) {

      throw createError(404, "No city found for this location");

    }

    if (typeof city.latitude !== "number" || typeof city.longitude !== "number") {

      throw createError(400, "This city has no coordinates yet");

    }

    // $geoWithin (unlike $near) works with countDocuments and pagination
    filter.location = {

      $geoWithin: {

        $centerSphere: [

          [city.longitude, city.latitude],

          SEARCH_RADIUS_KM / EARTH_RADIUS_KM,

        ],

      },

    };

  }

  // FR-31: type of care
  if (query.serviceModel) {

    const serviceModel = await homeRepository.findServiceModelBySlug(

      query.serviceModel

    );

    if (!serviceModel) throw createError(404, "Type of care not found");

    filter.serviceModels = serviceModel._id;

  }

  // FR-32, FR-33: the home's array must contain the chosen value
  if (query.lengthOfStay) filter.lengthOfStay = query.lengthOfStay;

  if (query.roomType) filter.roomTypes = query.roomType;

  // FR-34: homes with no approved review have averageRating 0,
  // so they are hidden when a minimum rating is set
  if (query.minRating) filter.averageRating = { $gte: query.minRating };

  // FR-35: every ticked facility must be offered
  if (query.facilities && query.facilities.length > 0) {

    filter.facilities = { $all: query.facilities };

  }

  const skip = (page - 1) * limit;

  const [homes, total] = await Promise.all([

    homeRepository.search(filter, { skip, limit }),

    homeRepository.count(filter),

  ]);

  // FR-37: total is the number of matching homes
  return { homes, total, page, pages: Math.ceil(total / limit) };

};


// =======================================
// GET ONE HOME (FR-10, FR-11)
// Accepts an id or a slug. Public: an unlisted home is "not found".
// TODO (Review module): add the approved reviews (FR-13).
// =======================================

export const getHome = async (idOrSlug) => {

  const home = looksLikeId(idOrSlug)

    ? await homeRepository.findByIdWithDetails(idOrSlug)

    : await homeRepository.findBySlugWithDetails(idOrSlug.toLowerCase());

  if (!home || !home.isListed) throw createError(404, "Home not found");

  return withAmenitiesByCategory(home);

};


// =======================================
// ADMIN: GET ONE HOME (listed or unlisted)
// Used by the admin edit form.
// =======================================

export const getHomeForAdmin = async (id) => {

  const home = await homeRepository.findByIdWithDetails(id);

  if (!home) throw createError(404, "Home not found");

  return withAmenitiesByCategory(home);

};


// =======================================
// ADMIN: LIST ALL HOMES (listed and unlisted)
// query.isListed true / false filters, left out means all.
// =======================================

export const getAllHomesForAdmin = async (query) => {

  const { page, limit } = query;

  const filter = {};

  if (query.isListed !== undefined) filter.isListed = query.isListed;

  const skip = (page - 1) * limit;

  const [homes, total] = await Promise.all([

    homeRepository.searchAll(filter, { skip, limit }),

    homeRepository.count(filter),

  ]);

  return { homes, total, page, pages: Math.ceil(total / limit) };

};


// =======================================
// MY HOMES (FR-40)
// A vendor still sees their own unlisted homes.
// =======================================

export const getMyHomes = async (vendorId) => {

  return homeRepository.findByVendor(vendorId);

};


// =======================================
// CREATE HOME (FR-14, FR-15, FR-40)
// Goes live immediately.
//  - vendor: owns the home, the vendor id comes from the JWT.
//  - admin: must choose the vendor (body.vendor) and may link the
//    home to a provider request (body.listingRequestId).
// =======================================

export const createHome = async (body, user, files = []) => {

  if (files.length === 0) {

    throw createError(400, "At least one home image is required");

  }

  const isAdmin = user.role === "admin";

  // ---------- Who owns the home ----------
  let vendorId;

  if (isAdmin) {

    if (!body.vendor) throw createError(400, "Please choose a vendor");

    const vendorUser = await userRepository.findById(body.vendor);

    if (!vendorUser || vendorUser.role !== "vendor") {

      throw createError(400, "Vendor not found");

    }

    vendorId = vendorUser._id;

  }

  else {

    // A vendor can only create homes for themselves
    if (body.vendor || body.listingRequestId) {

      throw createError(403, "Only an admin can use this field");

    }

    vendorId = user._id;

  }

  // ---------- Provider request (checked BEFORE the home is saved) ----------
  let listingRequest = null;

  if (body.listingRequestId) {

    listingRequest = await listingRequestRepository.findById(

      body.listingRequestId

    );

    if (!listingRequest) throw createError(404, "Listing request not found");

    if (listingRequest.home) {

      throw createError(409, "A home was already created for this request");

    }

  }

  // ---------- References, location and slug ----------
  const city = await assertReferencesExist(body);

  // The admin form sends no coordinates, so the city's are used
  let latitude = body.latitude;

  let longitude = body.longitude;

  if (latitude === undefined) {

    if (typeof city.latitude !== "number" || typeof city.longitude !== "number") {

      throw createError(400, "This city has no coordinates yet");

    }

    latitude = city.latitude;

    longitude = city.longitude;

  }

  const slug = await buildUniqueSlug(body.name, city.slug);

  const data = {

    name: body.name,

    slug,

    description: body.description,

    address: body.address,

    area: body.area,

    city: body.city,

    rentPerMonth: body.rentPerMonth,

    serviceModels: body.serviceModels,

    amenities: body.amenities ?? [],

    lengthOfStay: body.lengthOfStay ?? [],

    roomTypes: body.roomTypes ?? [],

    facilities: body.facilities ?? [],

    location: toPoint(latitude, longitude),

    // Public folder, so the URL can be stored as it is
    images: files.map((file) => `${IMAGE_URL_PREFIX}${file.filename}`),

    vendor: vendorId,

  };

  let home;

  try {

    home = await homeRepository.create(data);

  }

  catch (err) {

    // Two homes with the same slug created at the same time
    if (err.code === 11000) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

    throw err;

  }

  // The request now points to its home and counts as approved
  if (listingRequest) {

    await listingRequestRepository.linkHome(listingRequest._id, home._id);

  }

  return home;

};


// =======================================
// UPDATE HOME (admin / manager)
// Vendors cannot edit (FR-16). Mistakes are corrected by staff (section 8).
// Images are changed with addImages / removeImages.
// The slug never changes, so links don't break.
// =======================================

export const updateHome = async (id, body) => {

  const home = await homeRepository.findById(id);

  if (!home) throw createError(404, "Home not found");

  await assertReferencesExist(body);

  const data = {};

  EDITABLE_FIELDS.forEach((field) => {

    if (body[field] !== undefined) data[field] = body[field];

  });

  if (body.latitude !== undefined) {

    data.location = toPoint(body.latitude, body.longitude);

  }

  return homeRepository.updateById(id, data);

};


// =======================================
// ADMIN: LIST OR UNLIST A HOME
// =======================================

export const setListing = async (id, isListed) => {

  const home = await homeRepository.findById(id);

  if (!home) throw createError(404, "Home not found");

  return homeRepository.updateById(id, { isListed });

};


// =======================================
// ADMIN: ADD IMAGES
// The files are already saved by the upload middleware.
// =======================================

export const addImages = async (id, files = []) => {

  if (files.length === 0) {

    throw createError(400, "Choose at least one image");

  }

  const home = await homeRepository.findById(id);

  if (!home) throw createError(404, "Home not found");

  if (home.images.length + files.length > MAX_IMAGES) {

    throw createError(

      400,

      `A home can have at most ${MAX_IMAGES} images (it has ${home.images.length})`

    );

  }

  const urls = files.map((file) => `${IMAGE_URL_PREFIX}${file.filename}`);

  return homeRepository.addImagesById(id, urls);

};


// =======================================
// ADMIN: REMOVE IMAGES
// Only urls that belong to this home are accepted,
// and the home must keep at least one image.
// =======================================

export const removeImages = async (id, urls) => {

  const home = await homeRepository.findById(id);

  if (!home) throw createError(404, "Home not found");

  const notFound = urls.filter((url) => !home.images.includes(url));

  if (notFound.length > 0) {

    throw createError(400, "One or more images do not belong to this home");

  }

  if (home.images.length - urls.length < 1) {

    throw createError(400, "A home must keep at least one image");

  }

  const updated = await homeRepository.removeImagesById(id, urls);

  // Delete the files only after the database was updated
  await deleteImageFiles(urls);

  return updated;

};