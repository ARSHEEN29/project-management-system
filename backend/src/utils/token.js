import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token for the user ID.
 * @param {number} userId 
 * @returns {string} token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
