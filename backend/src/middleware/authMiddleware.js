import jwt from 'jsonwebtoken';
import prisma from '../services/db.js';
import { UnauthorizedError } from '../utils/errors.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for authorization header with Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in. Please log in to access this resource.');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired authentication token.');
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // Grant access to protected route by saving user in req
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
