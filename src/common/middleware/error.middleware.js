// =======================================
// 404: UNKNOWN ROUTES
// Runs when no route matched the URL.
// =======================================

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// =======================================
// CATCH-ALL ERROR HANDLER
// Must be the last middleware in app.js.
// Turns any error into a clean JSON response.
// =======================================

export const errorHandler = (err, req, res, next) => {
  // If headers are already sent, let Express close the connection
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Something went wrong";

  // Invalid JSON in the request body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // Mongoose: bad ObjectId, e.g. /api/homes/abc
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: schema validation failed
  else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // MongoDB: duplicate key (email, slug, and so on)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate value";
  }

  // JWT problems
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer upload errors (file too large, too many files)
  else if (err.name === "MulterError") {
    statusCode = 400;
  }

  // Log server errors only. 4xx errors are the client's fault.
  if (statusCode >= 500) {
    console.error("SERVER ERROR:", err);
    // Never leak internal details in production
    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};