import bcrypt from 'bcryptjs';
import prisma from '../services/db.js';
import { generateToken } from '../utils/token.js';
import { successResponse } from '../utils/response.js';
import { AppError, BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../services/auditLogService.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('Email address is already in use.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    // Create audit log
    await createAuditLog({
      action: 'REGISTER',
      entityType: 'USER',
      entityId: user.id,
      details: `User ${user.fullName} (${user.email}) registered.`,
      userId: user.id,
    });

    return successResponse(res, 'Registration successful.', { user, token }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    // Create audit log
    await createAuditLog({
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      details: `User ${user.fullName} logged in.`,
      userId: user.id,
    });

    // Format output
    const userOutput = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    };

    return successResponse(res, 'Login successful.', { user: userOutput, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await createAuditLog({
        action: 'LOGOUT',
        entityType: 'USER',
        entityId: req.user.id,
        details: `User ${req.user.fullName} logged out.`,
        userId: req.user.id,
      });
    }

    return successResponse(res, 'Logout successful.');
  } catch (error) {
    next(error);
  }
};
