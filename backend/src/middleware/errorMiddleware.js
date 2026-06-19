import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error stack for developers in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', err);
  }

  // Handle Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const field = err.meta?.target || 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, 400);
  }

  // Handle Prisma Record Not Found (foreign key failures or missing relations)
  if (err.code === 'P2025') {
    return errorResponse(res, err.meta?.cause || 'Resource not found', 404);
  }

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return errorResponse(res, err.message, err.statusCode, err.errors);
  }

  // Programming or other unknown error: don't leak details
  return errorResponse(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server.',
    err.statusCode
  );
};
