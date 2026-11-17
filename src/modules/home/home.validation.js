import Joi from "joi";

import {
  FACILITIES,
  LENGTH_OF_STAY,
  ROOM_TYPES,
} from "./home.model.js";


// =======================================
// FIXED LISTS
// They live in home.model.js (one place), and are re-exported here
// so anything that already imports them from this file keeps working.
// =======================================

export { LENGTH_OF_STAY, ROOM_TYPES, FACILITIES };


// =======================================
// REUSABLE FIELD RULES
// =======================================

const objectId = Joi.string().hex().length(24).messages({

  "string.hex": "Must be a valid id",

  "string.length": "Must be a valid id",

});

// Multipart forms and query strings send one value as a plain string
// and several values as an array. .single() accepts both.
const list = (item) => Joi.array().items(item).single().unique();


// =======================================
// HOME FIELDS (shared by create and update)
// =======================================

const homeFields = {

  name: Joi.string().trim().min(2).max(150).label("Home name"),

  description: Joi.string().trim().max(3000).allow("").label("Description"),

  address: Joi.string().trim().min(3).max(300).label("Address"),

  area: Joi.string().trim().min(2).max(100).label("Area"),

  city: objectId.label("City"),

  // Optional on create: if they are left out, the service uses the
  // city's own coordinates. Stored as a GeoJSON point.
  latitude: Joi.number().min(-90).max(90).label("Latitude"),

  longitude: Joi.number().min(-180).max(180).label("Longitude"),

  rentPerMonth: Joi.number().positive().label("Monthly rent"),

  // FR-7: a home can offer more than one, at least one is needed
  serviceModels: list(objectId).min(1).label("Service models"),

  amenities: list(objectId).label("Amenities"),

  // FR-36
  lengthOfStay: list(Joi.string().valid(...LENGTH_OF_STAY)).label("Length of stay"),

  roomTypes: list(Joi.string().valid(...ROOM_TYPES)).label("Room types"),

  facilities: list(Joi.string().valid(...FACILITIES)).label("Facilities"),

};


// =======================================
// CREATE HOME (FR-14)
// Unknown fields are rejected by validate(), so a vendor cannot send
// slug, scores, averageRating, reviewCount or isListed.
//
// "vendor" is accepted here, but only an admin may use it:
// the service rejects it for a vendor and requires it for an admin.
// "listingRequestId" links the new home to a provider request.
// =======================================

export const createHomeSchema = Joi.object(homeFields)

  .fork(

    [
      "name",
      "address",
      "area",
      "city",
      "rentPerMonth",
      "serviceModels",
    ],

    (field) => field.required()

  )

  .keys({

    vendor: objectId.label("Vendor"),

    listingRequestId: objectId.label("Listing request"),

  })

  .and("latitude", "longitude")

  .messages({

    "object.and": "Send latitude and longitude together",

  });


// =======================================
// UPDATE HOME (admin / manager corrections)
// Every field optional, at least one needed.
// latitude and longitude must be sent together.
// =======================================

export const updateHomeSchema = Joi.object(homeFields)

  .min(1)

  .and("latitude", "longitude")

  .messages({

    "object.min": "Send at least one field to update",

    "object.and": "Send latitude and longitude together",

  });


// =======================================
// LIST / SEARCH QUERY (FR-8, FR-30 to FR-35)
// Every filter has an "any" default: leave it out (or send an empty value).
// =======================================

export const listHomesQuerySchema = Joi.object({

  // FR-30: city slug from the dropdown
  city: Joi.string().trim().lowercase().max(100).empty(""),

  // FR-8: typed city name, homes within 100 km
  location: Joi.string().trim().max(100).empty(""),

  // FR-31: service model (type of care) slug
  serviceModel: Joi.string().trim().lowercase().max(100).empty(""),

  lengthOfStay: Joi.string().valid(...LENGTH_OF_STAY).empty(""),

  roomType: Joi.string().valid(...ROOM_TYPES).empty(""),

  // FR-34
  minRating: Joi.number().valid(4, 4.5).empty(""),

  // FR-35: a home must offer every ticked facility
  facilities: list(Joi.string().valid(...FACILITIES)),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(12),

});


// =======================================
// ADMIN: HOMES LIST QUERY
// GET /homes/admin?isListed=true&page=1&limit=10
// isListed left out (or empty) means "all homes".
// =======================================

export const adminListQuerySchema = Joi.object({

  isListed: Joi.boolean().empty(""),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(10),

});


// =======================================
// ADMIN: LIST OR UNLIST A HOME
// PATCH /homes/:id/listing   body: { "isListed": false }
// =======================================

export const setListingSchema = Joi.object({

  isListed: Joi.boolean().required().label("isListed"),

});


// =======================================
// ADMIN: REMOVE IMAGES
// DELETE /homes/:id/images   body: { "images": ["/uploads/homes/a.jpg"] }
// The service checks that each url really belongs to this home.
// =======================================

export const removeImagesSchema = Joi.object({

  images: Joi.array()

    .items(Joi.string().trim().max(300))

    .min(1)

    .unique()

    .required()

    .label("Images"),

});