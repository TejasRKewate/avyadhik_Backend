// =======================================
// VALIDATE BODY
// Usage: validate(schema)
// =======================================

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    req.body = value;
    next();
  };
};


// =======================================
// VALIDATE QUERY STRING
// Usage: validateQuery(schema)
// The checked query is placed on req.validatedQuery
// (req.query is read-only in Express 5, so it is not overwritten).
// =======================================

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    req.validatedQuery = value;
    next();
  };
};