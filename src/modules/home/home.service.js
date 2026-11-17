import * as homeRepository from "./home.repository.js";


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
const RESERVED_SLUGS = ["mine"];

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


// =======================================
// SEARCH HOMES (FR-8, FR-9, FR-30 to FR-37)
// A home must match every filter that is set.
// =======================================

export const searchHomes = async (query) => {

  const { page, limit } = query;

  const filter = {};

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
// Accepts an id or a slug.
// TODO (Review module): add the approved reviews (FR-13).
// =======================================

export const getHome = async (idOrSlug) => {

  const home = looksLikeId(idOrSlug)

    ? await homeRepository.findByIdWithDetails(idOrSlug)

    : await homeRepository.findBySlugWithDetails(idOrSlug.toLowerCase());

  if (!home) throw createError(404, "Home not found");

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


// =======================================
// MY HOMES (FR-40)
// =======================================

export const getMyHomes = async (vendorId) => {

  return homeRepository.findByVendor(vendorId);

};


// =======================================
// CREATE HOME (FR-14, FR-15, FR-40)
// Goes live immediately. The vendor comes from the JWT, never the body.
// =======================================

export const createHome = async (body, vendorId, files = []) => {

  if (files.length === 0) {

    throw createError(400, "At least one home image is required");

  }

  const city = await assertReferencesExist(body);

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

    location: toPoint(body.latitude, body.longitude),

    // Public folder, so the URL can be stored as it is
    images: files.map((file) => `/uploads/homes/${file.filename}`),

    vendor: vendorId,

  };

  try {

    return await homeRepository.create(data);

  }

  catch (err) {

    // Two homes with the same slug created at the same time
    if (err.code === 11000) {

      throw createError(409, DUPLICATE_MESSAGE);

    }

    throw err;

  }

};


// =======================================
// UPDATE HOME (admin / manager)
// Vendors cannot edit (FR-16). Mistakes are corrected by staff (section 8).
// Images are not changed here. The slug never changes, so links don't break.
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