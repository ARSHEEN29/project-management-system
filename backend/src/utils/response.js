/**
 * Standard Success Response Formatter
 */
export const successResponse = (res, message, data = {}, statusCode = 200, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra
  });
};

/**
 * Standard Error Response Formatter
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined
  });
};
