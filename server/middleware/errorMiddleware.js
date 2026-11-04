const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200
    ? 500
    : res.statusCode;

  let message = error.message || "Internal server error.";

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (error.code === 11000) {
    statusCode = 409;
    message =
      "This email is already registered for this event.";
  }

  console.error(error);

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  notFound,
  errorHandler
};