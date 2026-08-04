const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with these values already exists';
  }

  const response = { message };
  if (process.env.NODE_ENV !== 'production') response.stack = error.stack;

  return res.status(statusCode).json(response);
};

module.exports = { errorHandler, notFound };
