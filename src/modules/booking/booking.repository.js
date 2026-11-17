
import Booking from "./booking.model.js";
import Home from "../home/home.model.js";

const USER_FIELDS = "name email phone";
const HOME_FIELDS = "name slug area city rentPerMonth vendor";

export const create = async (data) => {
  const booking = await Booking.create(data);
  return booking;
};

export const findById = async (id) => {
  return Booking.findById(id)
    .populate("user", USER_FIELDS)
    .populate("home", HOME_FIELDS);
};

// Generic paginated list. Pass a filter such as {}, { user: id }
// or { home: { $in: homeIds } }, plus an optional status.
export const findPaginated = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate("user", USER_FIELDS)
      .populate("home", HOME_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Ids of every home a vendor owns (a vendor can own many homes, FR-40).
// Used to find a vendor's bookings through Booking.home.
export const findHomeIdsByVendor = async (vendorId) => {
  const homes = await Home.find({ vendor: vendorId }).select("_id");
  return homes.map((h) => h._id);
};

export const updateStatus = async (id, status) => {
  return Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("user", USER_FIELDS)
    .populate("home", HOME_FIELDS);
};

// FR-28: used by the Review module. True only if this user has an
// admitted booking for this home.
export const hasAdmittedBooking = async (userId, homeId) => {
  const found = await Booking.exists({
    user: userId,
    home: homeId,
    status: "admitted",
  });
  return Boolean(found);
};