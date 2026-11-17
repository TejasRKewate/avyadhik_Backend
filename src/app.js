import express from "express";
import cors from "cors";
import path from "path";

import userRoutes from "./modules/user/user.routes.js";
import cityRoutes from "./modules/city/city.routes.js";
import serviceModelRoutes from "./modules/serviceModel/serviceModel.routes.js";
import amenityRoutes from "./modules/amenity/amenity.routes.js";
import homeRoutes from "./modules/home/home.routes.js";
import enquiryRoutes from "./modules/enquiry/enquiry.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import listingRequestRoutes from "./modules/listingRequest/listingRequest.routes.js";

import {
  notFound,
  errorHandler,
} from "./common/middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public static files (home photos only).
// "private-uploads" (health reports) is deliberately NOT served here.
// Those files must only be sent through a protected route that checks
// the role and ownership first (FR-26).
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "oldAgeHome API Running",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/service-models", serviceModelRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/homes", homeRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/listing-requests", listingRequestRoutes);

// Unknown routes, then the catch-all error handler. Both must be last.
app.use(notFound);
app.use(errorHandler);

export default app;