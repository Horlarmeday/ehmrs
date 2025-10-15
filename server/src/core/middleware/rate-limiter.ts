import rateLimit from 'express-rate-limit';
import { StatusCodes } from '../helpers/helper';

/**
 * General API rate limiter
 * Protects against brute force and DoS attacks
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
    statusCode: StatusCodes.TIMED_OUT,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for file upload endpoints
 * Prevents abuse of resource-intensive operations
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 upload requests per windowMs
  message: {
    error: 'Too many file upload requests, please try again later',
    statusCode: StatusCodes.TIMED_OUT,
    details: 'Maximum 20 uploads per 15 minutes allowed',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain IPs (e.g., localhost in development)
  skip: (req) => {
    // Skip rate limiting in development for localhost
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.socket.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    }
    return false;
  },
});

/**
 * Very strict rate limiter for authentication endpoints
 * Protects against credential stuffing and brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again after 15 minutes',
    statusCode: StatusCodes.TIMED_OUT,
    details: 'Maximum 5 login attempts per 15 minutes allowed',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Moderate rate limiter for data modification endpoints
 * Protects against rapid automated changes
 */
export const modificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 modification requests per 5 minutes
  message: {
    error: 'Too many modification requests, please slow down',
    statusCode: StatusCodes.TIMED_OUT,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Lenient rate limiter for read-only endpoints
 * Allows higher throughput for data retrieval
 */
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 read requests per minute
  message: {
    error: 'Too many requests, please try again shortly',
    statusCode: StatusCodes.TIMED_OUT,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
