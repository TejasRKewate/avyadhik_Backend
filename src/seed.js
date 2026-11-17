import "dotenv/config";
import mongoose from "mongoose";

import City from "./modules/city/city.model.js";
import ServiceModel from "./modules/serviceModel/serviceModel.model.js";
import Amenity from "./modules/amenity/amenity.model.js";
import Home from "./modules/home/home.model.js";
import User from "./modules/user/user.model.js";

// ---------------------------------------------------------------------------
// Master data
// ---------------------------------------------------------------------------

// 14 locations from FR-30 (without "All locations").
// Coordinates are the centre point for the 100 km search.
const cities = [
  { name: "Gurgaon", latitude: 28.4595, longitude: 77.0266 },
  { name: "Gurgaon & Delhi NCR", latitude: 28.6139, longitude: 77.209 },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Dehradun", latitude: 30.3165, longitude: 78.0322 },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
  { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  { name: "Hyderabad", latitude: 17.385, longitude: 78.4867 },
  { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  { name: "Kochi", latitude: 9.9312, longitude: 76.2673 },
  { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
  { name: "Bhiwadi", latitude: 28.2104, longitude: 76.86 },
  { name: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
  { name: "Chandigarh Tricity", latitude: 30.7333, longitude: 76.7794 },
];

// 6 type-of-care options from FR-31
const serviceModels = [
  {
    name: "Assisted living",
    description:
      "Help with daily activities such as bathing, dressing and medication, in a homely setting.",
  },
  {
    name: "Independent living",
    description:
      "For active seniors who want a safe community with services close by.",
  },
  {
    name: "Luxury senior living",
    description:
      "Premium residences with high-end amenities, hospitality and personal care.",
  },
  {
    name: "Dementia care",
    description:
      "Specialised care and secure environments for people with dementia or memory loss.",
  },
  {
    name: "Post-operative care",
    description:
      "Nursing and recovery support after surgery or hospital stays.",
  },
  {
    name: "Rehabilitation",
    description:
      "Physiotherapy and therapy programmes to help seniors regain independence.",
  },
];

// Amenity master list (SRS 4.4): 3 per category.
// "icon" is a plain key for now. Replace with image URLs when you have icons.
const amenities = [
  { name: "Yoga & meditation", icon: "yoga", category: "lifestyle" },
  { name: "Garden & walking paths", icon: "garden", category: "lifestyle" },
  { name: "Library & reading room", icon: "library", category: "lifestyle" },

  { name: "Physiotherapy", icon: "physio", category: "medical" },
  { name: "24x7 nursing", icon: "nurse", category: "medical" },
  { name: "Doctor on call", icon: "doctor", category: "medical" },

  { name: "Housekeeping", icon: "housekeeping", category: "services" },
  { name: "Laundry", icon: "laundry", category: "services" },
  { name: "Nutritious meals", icon: "meals", category: "services" },

  { name: "Clubhouse", icon: "clubhouse", category: "community" },
  { name: "Festival celebrations", icon: "festival", category: "community" },
  { name: "Group outings", icon: "outing", category: "community" },
];

// ---------------------------------------------------------------------------
// Fixed lists stored on Home (FR-32, FR-33, FR-35).
// IMPORTANT: these strings must match the enum values in home.model.js.
// If your model uses different spellings, change them here only.
// ---------------------------------------------------------------------------
const STAY = { long: "long-term", short: "short-stay", respite: "respite" };
const ROOM = {
  suite: "private suite",
  companion: "companion room",
  one: "one-bedroom residence",
  two: "two-bedroom residence",
};
const FAC = {
  nutrition: "Geriatric nutrition",
  medical: "24x7 medical assistance",
  holistic: "Holistic care",
  caregivers: "Personal caregivers",
  rehab: "Rehabilitation",
  dementia: "Dementia care",
  postop: "Post-operative care",
  parkinson: "Parkinson's care",
};

const img = (seed) => `https://picsum.photos/seed/${seed}/900/600`;

// Sample homes. city = city name, careTypes = service model names,
// amenityNames = from the list above.
const homes = [
  {
    name: "Serenity Heights",
    description:
      "Warm assisted living home with round-the-clock nurses, a garden and daily recreation.",
    city: "Pune",
    area: "Balewadi",
    address: "Plot 14, Balewadi High Street, Pune 411045",
    latitude: 18.5679,
    longitude: 73.7797,
    rentPerMonth: 58000,
    careTypes: ["Assisted living", "Dementia care"],
    lengthOfStay: [STAY.long, STAY.short],
    roomTypes: [ROOM.suite, ROOM.companion],
    facilities: [FAC.nutrition, FAC.medical, FAC.caregivers, FAC.dementia],
    amenityNames: ["24x7 nursing", "Garden & walking paths", "Nutritious meals", "Clubhouse", "Physiotherapy"],
    scores: { lifestyle: 8, medical: 9, services: 8, community: 7 },
    averageRating: 4.6,
    reviewCount: 48,
  },
  {
    name: "Lotus Grove Residences",
    description:
      "Premium senior living community with spacious residences and a wellness centre.",
    city: "Gurgaon",
    area: "South City 2",
    address: "Sector 50, South City 2, Gurgaon 122018",
    latitude: 28.4212,
    longitude: 77.0526,
    rentPerMonth: 92000,
    careTypes: ["Luxury senior living", "Independent living"],
    lengthOfStay: [STAY.long],
    roomTypes: [ROOM.one, ROOM.two],
    facilities: [FAC.nutrition, FAC.holistic, FAC.medical],
    amenityNames: ["Yoga & meditation", "Library & reading room", "Housekeeping", "Laundry", "Clubhouse", "Doctor on call"],
    scores: { lifestyle: 9, medical: 7, services: 9, community: 8 },
    averageRating: 4.8,
    reviewCount: 132,
  },
  {
    name: "Green Leaf Senior Care",
    description:
      "Assisted living facility with medical oversight and a calm, home-like atmosphere.",
    city: "Bengaluru",
    area: "Whitefield",
    address: "12 ITPL Road, Whitefield, Bengaluru 560066",
    latitude: 12.9698,
    longitude: 77.7499,
    rentPerMonth: 64000,
    careTypes: ["Assisted living", "Post-operative care"],
    lengthOfStay: [STAY.long, STAY.short, STAY.respite],
    roomTypes: [ROOM.suite],
    facilities: [FAC.medical, FAC.postop, FAC.nutrition, FAC.caregivers],
    amenityNames: ["24x7 nursing", "Physiotherapy", "Doctor on call", "Nutritious meals", "Housekeeping"],
    scores: { lifestyle: 7, medical: 9, services: 8, community: 7 },
    averageRating: 4.7,
    reviewCount: 89,
  },
  {
    name: "Calm Waters Care Home",
    description:
      "Memory care and rehabilitation with trained caregivers and physiotherapy on site.",
    city: "Chennai",
    area: "Arumbakkam",
    address: "45 MMDA Colony, Arumbakkam, Chennai 600106",
    latitude: 13.0732,
    longitude: 80.2101,
    rentPerMonth: 46000,
    careTypes: ["Assisted living", "Rehabilitation", "Dementia care"],
    lengthOfStay: [STAY.long, STAY.short, STAY.respite],
    roomTypes: [ROOM.companion, ROOM.suite],
    facilities: [FAC.rehab, FAC.dementia, FAC.caregivers, FAC.parkinson],
    amenityNames: ["Physiotherapy", "24x7 nursing", "Laundry", "Group outings", "Festival celebrations"],
    scores: { lifestyle: 7, medical: 8, services: 7, community: 8 },
    averageRating: 4.4,
    reviewCount: 27,
  },
  {
    name: "Anand Nivas",
    description:
      "Compact city care home for assisted living and dementia support close to hospitals.",
    city: "Mumbai",
    area: "Andheri West",
    address: "7 Lokhandwala Road, Andheri West, Mumbai 400053",
    latitude: 19.1364,
    longitude: 72.8296,
    rentPerMonth: 78000,
    careTypes: ["Assisted living", "Dementia care"],
    lengthOfStay: [STAY.long, STAY.short],
    roomTypes: [ROOM.companion, ROOM.suite],
    facilities: [FAC.medical, FAC.dementia, FAC.caregivers],
    amenityNames: ["24x7 nursing", "Doctor on call", "Housekeeping", "Nutritious meals"],
    scores: { lifestyle: 6, medical: 9, services: 8, community: 6 },
    averageRating: 4.2,
    reviewCount: 19,
  },
  {
    name: "Palm Court Elder Care",
    description:
      "Rehabilitation and post-operative recovery stays with physiotherapists and nurses.",
    city: "Kochi",
    area: "Kakkanad",
    address: "Infopark Road, Kakkanad, Kochi 682030",
    latitude: 10.0159,
    longitude: 76.3419,
    rentPerMonth: 49000,
    careTypes: ["Rehabilitation", "Post-operative care"],
    lengthOfStay: [STAY.short, STAY.respite],
    roomTypes: [ROOM.suite, ROOM.companion],
    facilities: [FAC.rehab, FAC.postop, FAC.medical, FAC.parkinson],
    amenityNames: ["Physiotherapy", "24x7 nursing", "Doctor on call", "Garden & walking paths", "Group outings"],
    scores: { lifestyle: 7, medical: 10, services: 8, community: 7 },
    averageRating: 4.9,
    reviewCount: 60,
  },
];

// ---------------------------------------------------------------------------

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing in .env");

  await mongoose.connect(uri);
  console.log("✅ MongoDB Connected");

  // Cities (safe to run again: matches on slug)
  for (const c of cities) {
    const slug = slugify(c.name);
    await City.updateOne({ slug }, { $set: { ...c, slug } }, { upsert: true });
  }
  console.log(`✅ ${cities.length} cities seeded`);

  // Service models
  for (const s of serviceModels) {
    const slug = slugify(s.name);
    await ServiceModel.updateOne({ slug }, { $set: { ...s, slug } }, { upsert: true });
  }
  console.log(`✅ ${serviceModels.length} service models seeded`);

  // Amenities (matched on name + category)
  for (const a of amenities) {
    await Amenity.updateOne(
      { name: a.name, category: a.category },
      { $set: a },
      { upsert: true }
    );
  }
  console.log(`✅ ${amenities.length} amenities seeded`);

  // First admin (created once, never overwritten)
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("⚠️  ADMIN_EMAIL or ADMIN_PASSWORD missing, admin skipped");
  } else {
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log("ℹ️  Admin already exists, skipped");
    } else {
      await User.create({
        name: ADMIN_NAME || "Admin",
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE || "9999999999",
        password: ADMIN_PASSWORD, // hashed by the model
        role: "admin",
      });
      console.log("✅ Admin created");
    }
  }

  // Sample vendor (created once). Change these in .env if you like.
  const vendorEmail = (process.env.SEED_VENDOR_EMAIL || "vendor@avyadhik.test").toLowerCase();
  let vendor = await User.findOne({ email: vendorEmail });
  if (!vendor) {
    vendor = await User.create({
      name: "Sample Vendor",
      email: vendorEmail,
      phone: "9888888888",
      password: process.env.SEED_VENDOR_PASSWORD || "Vendor@123",
      role: "vendor",
    });
    console.log(`✅ Sample vendor created (${vendorEmail})`);
  } else {
    console.log("ℹ️  Sample vendor already exists, skipped");
  }

  // Look up ids once
  const cityDocs = await City.find({});
  const cityByName = Object.fromEntries(cityDocs.map((c) => [c.name, c._id]));
  const smDocs = await ServiceModel.find({});
  const smByName = Object.fromEntries(smDocs.map((s) => [s.name, s._id]));
  const amDocs = await Amenity.find({});
  const amByName = Object.fromEntries(amDocs.map((a) => [a.name, a._id]));

  // Sample homes (matched on slug, so running again updates instead of duplicating)
  for (const h of homes) {
    const slug = slugify(h.name);

    if (!cityByName[h.city]) throw new Error(`City not found: ${h.city}`);
    const serviceModelIds = h.careTypes.map((n) => {
      if (!smByName[n]) throw new Error(`Service model not found: ${n}`);
      return smByName[n];
    });
    const amenityIds = h.amenityNames.map((n) => {
      if (!amByName[n]) throw new Error(`Amenity not found: ${n}`);
      return amByName[n];
    });

    await Home.updateOne(
      { slug },
      {
        $set: {
          name: h.name,
          slug,
          description: h.description,
          city: cityByName[h.city],
          area: h.area,
          address: h.address,
          // GeoJSON order is [longitude, latitude]
          location: { type: "Point", coordinates: [h.longitude, h.latitude] },
          rentPerMonth: h.rentPerMonth,
          serviceModels: serviceModelIds,
          amenities: amenityIds,
          scores: h.scores,
          images: [img(`${slug}-1`), img(`${slug}-2`), img(`${slug}-3`)],
          vendor: vendor._id,
          lengthOfStay: h.lengthOfStay,
          roomTypes: h.roomTypes,
          facilities: h.facilities,
          // Sample values only. Real values come from approved reviews.
          averageRating: h.averageRating,
          reviewCount: h.reviewCount,
        },
      },
      { upsert: true }
    );
  }
  console.log(`✅ ${homes.length} sample homes seeded`);

  await mongoose.disconnect();
  console.log("Done");
};

seed().catch(async (err) => {
  console.error("❌ Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});